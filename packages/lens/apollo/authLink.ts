import { ApolloLink, fromPromise, toPromise } from '@apollo/client';
import { API_URL } from '@hey/data/constants';
import { Cookie, Localstorage } from '@hey/data/storage';
import axios from 'axios';
import Cookies from 'js-cookie';

import { parseJwt } from './lib';

const resetAuthData = () => {
  localStorage.removeItem(Localstorage.ModeStore);
  localStorage.removeItem(Localstorage.NotificationStore);
  localStorage.removeItem(Localstorage.TransactionStore);
  localStorage.removeItem(Localstorage.TimelineStore);
  localStorage.removeItem(Localstorage.MessageStore);
  localStorage.removeItem(Localstorage.AttachmentCache);
  localStorage.removeItem(Localstorage.AttachmentStore);
  localStorage.removeItem(Localstorage.NonceStore);
};

const REFRESH_AUTHENTICATION_MUTATION = `
  mutation Refresh($request: RefreshRequest!) {
    refresh(request: $request) {
      accessToken
      refreshToken
    }
  }
`;

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = Cookies.get(Cookie.AccessToken);
  const refreshToken = Cookies.get(Cookie.RefreshToken);

  if (!accessToken || accessToken === 'undefined') {
    resetAuthData();
    return forward(operation);
  }

  const expiringSoon = Date.now() >= parseJwt(accessToken)?.exp * 1000;

  if (!expiringSoon) {
    operation.setContext({
      headers: {
        'x-access-token': accessToken ? `Bearer ${accessToken}` : ''
      }
    });

    return forward(operation);
  }

  return fromPromise(
    axios
      .post(
        API_URL,
        {
          operationName: 'Refresh',
          query: REFRESH_AUTHENTICATION_MUTATION,
          variables: { request: { refreshToken } }
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then(({ data }) => {
        const accessToken = data?.data?.refresh?.accessToken;
        const refreshToken = data?.data?.refresh?.refreshToken;
        operation.setContext({
          headers: { 'x-access-token': `Bearer ${accessToken}` }
        });

        Cookies.set(Cookie.AccessToken, accessToken, {
          expires: 30,
          path: '/',
          sameSite: 'Lax',
          secure: true
        });
        Cookies.set(Cookie.RefreshToken, refreshToken, {
          expires: 30,
          path: '/',
          sameSite: 'Lax',
          secure: true
        });

        return toPromise(forward(operation));
      })
      .catch(() => {
        return toPromise(forward(operation));
      })
  );
});

export default authLink;
