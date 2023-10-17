import Attachments from '@components/Shared/Attachments';
import Quote from '@components/Shared/Embed/Quote';
import Markup from '@components/Shared/Markup';
import Oembed from '@components/Shared/Oembed';
import { EyeIcon } from '@heroicons/react/24/outline';
import type { AnyPublication } from '@hey/lens';
import getPublicationData from '@hey/lib/getPublicationData';
import getSnapshotProposalId from '@hey/lib/getSnapshotProposalId';
import getURLs from '@hey/lib/getURLs';
import isPublicationMetadataTypeAllowed from '@hey/lib/isPublicationMetadataTypeAllowed';
import { isMirrorPublication } from '@hey/lib/publicationHelpers';
import removeUrlAtEnd from '@hey/lib/removeUrlAtEnd';
import type { OG } from '@hey/types/misc';
import cn from '@hey/ui/cn';
import Link from 'next/link';
import type { FC } from 'react';
import { useState } from 'react';
import { isIOS, isMobile } from 'react-device-detect';

import Nft from './HeyOpenActions/Nft';
import Snapshot from './HeyOpenActions/Snapshot';
import NotSupportedPublication from './NotSupportedPublication';

interface PublicationBodyProps {
  publication: AnyPublication;
  showMore?: boolean;
  quoted?: boolean;
}

const PublicationBody: FC<PublicationBodyProps> = ({
  publication,
  showMore = false,
  quoted = false
}) => {
  const targetPublication = isMirrorPublication(publication)
    ? publication.mirrorOn
    : publication;
  const { id, metadata } = targetPublication;

  const filteredContent = getPublicationData(metadata)?.content || '';
  const filteredAttachments = getPublicationData(metadata)?.attachments || [];
  const filteredAsset = getPublicationData(metadata)?.asset;

  const canShowMore = filteredContent?.length > 450 && showMore;
  const urls = getURLs(filteredContent);
  const hasURLs = urls.length > 0;
  const snapshotProposalId = getSnapshotProposalId(urls);

  const filterId = snapshotProposalId;
  let rawContent = filteredContent;

  if (isIOS && isMobile && canShowMore) {
    const truncatedRawContent = rawContent?.split('\n')?.[0];
    if (truncatedRawContent) {
      rawContent = truncatedRawContent;
    }
  }

  if (filterId) {
    for (const url of urls) {
      if (url.includes(filterId)) {
        rawContent = rawContent.replace(url, '');
      }
    }
  }

  const [content, setContent] = useState(rawContent);

  if (!isPublicationMetadataTypeAllowed(metadata.__typename)) {
    return <NotSupportedPublication type={metadata.__typename} />;
  }

  // Show NFT if it's there
  const showNft = metadata.__typename === 'MintMetadataV3';
  // Show snapshot if it's there
  const showSnapshot = snapshotProposalId;
  // Show attachments if it's there
  const showAttachments = filteredAttachments.length > 0 || filteredAsset;
  // Show oembed if no NFT, no attachments, no snapshot, no quoted publication
  const showOembed =
    hasURLs && !showNft && !showAttachments && !showSnapshot && !quoted;

  // Remove URL at the end if oembed is there
  const onOembedData = (data: OG) => {
    if (showOembed && data?.title) {
      const updatedContent = removeUrlAtEnd(urls, content);
      if (updatedContent !== content) {
        setContent(updatedContent);
      }
    }
  };

  return (
    <div className="break-words">
      <Markup
        className={cn(
          { 'line-clamp-5': canShowMore },
          'markup linkify text-md break-words'
        )}
      >
        {content}
      </Markup>
      {canShowMore ? (
        <div className="lt-text-gray-500 mt-4 flex items-center space-x-1 text-sm font-bold">
          <EyeIcon className="h-4 w-4" />
          <Link href={`/posts/${id}`}>Show more</Link>
        </div>
      ) : null}
      {/* Attachments and Quotes */}
      {showAttachments ? (
        <Attachments attachments={filteredAttachments} asset={filteredAsset} />
      ) : null}
      {/* Open actions */}
      {showSnapshot ? <Snapshot proposalId={snapshotProposalId} /> : null}
      {showNft ? (
        <Nft mintLink={metadata.mintLink} publication={publication} />
      ) : null}
      {showOembed ? (
        <Oembed
          url={urls[0]}
          publicationId={publication.id}
          onData={onOembedData}
        />
      ) : null}
      {targetPublication.__typename === 'Quote' && (
        <Quote publication={targetPublication.quoteOn} />
      )}
    </div>
  );
};

export default PublicationBody;
