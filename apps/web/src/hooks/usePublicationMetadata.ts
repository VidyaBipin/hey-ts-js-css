import { APP_NAME } from '@hey/data/constants';
import getURLs from '@hey/lib/getURLs';
import getNft from '@hey/lib/nft/getNft';
import { audio, image, mint, textOnly, video } from '@lens-protocol/metadata';
import getUserLocale from '@lib/getUserLocale';
import { useCallback } from 'react';
import { usePublicationStore } from 'src/store/publication';
import { v4 as uuid } from 'uuid';

interface UsePublicationMetadataProps {
  baseMetadata: any;
}

const usePublicationMetadata = () => {
  const {
    attachments,
    audioPublication,
    videoThumbnail,
    videoDurationInSeconds,
    publicationContent
  } = usePublicationStore();

  const attachmentsHasAudio = attachments[0]?.type === 'Audio';
  const attachmentsHasVideo = attachments[0]?.type === 'Video';

  const cover = attachmentsHasAudio
    ? audioPublication.cover
    : attachmentsHasVideo
    ? videoThumbnail.url
    : attachments[0]?.uri;

  const getMetadata = useCallback(
    ({ baseMetadata }: UsePublicationMetadataProps) => {
      const urls = getURLs(publicationContent);

      const hasAttachments = attachments.length;
      const isImage = attachments[0]?.type === 'Image';
      const isAudio = attachments[0]?.type === 'Audio';
      const isVideo = attachments[0]?.type === 'Video';
      const isMint = Boolean(getNft(urls)?.mintLink);

      const localBaseMetadata = {
        id: uuid(),
        locale: getUserLocale(),
        appId: APP_NAME
      };

      switch (true) {
        case isMint:
          return mint({
            ...baseMetadata,
            ...localBaseMetadata,
            mintLink: getNft(urls)?.mintLink
          });
        case !hasAttachments:
          return textOnly({
            ...baseMetadata,
            ...localBaseMetadata
          });
        case isImage:
          return image({
            ...baseMetadata,
            ...localBaseMetadata,
            image: {
              item: attachments[0]?.uri,
              type: attachments[0]?.mimeType
            },
            attachments: attachments.map((attachment) => ({
              item: attachment.uri,
              type: attachment.mimeType,
              cover: cover
            }))
          });
        case isAudio:
          return audio({
            ...baseMetadata,
            ...localBaseMetadata,
            audio: {
              item: attachments[0]?.uri,
              type: attachments[0]?.mimeType,
              artist: audioPublication.artist
            }
          });
        case isVideo:
          return video({
            ...baseMetadata,
            ...localBaseMetadata,
            video: {
              item: attachments[0]?.uri,
              type: attachments[0]?.mimeType,
              duration: parseInt(videoDurationInSeconds)
            }
          });
        default:
          return null;
      }
    },
    [
      attachments,
      videoDurationInSeconds,
      audioPublication,
      cover,
      publicationContent
    ]
  );

  return getMetadata;
};

export default usePublicationMetadata;
