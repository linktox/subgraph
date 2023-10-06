import {
  log,
  ethereum,
  store,
  Bytes,
  Address,
  BigInt,
  Entity,
  Value,
  ValueKind
} from "@graphprotocol/graph-ts";

import {
  InviteAccept as InviteAcceptEvent,
  InviteSend as InviteSendEvent,
  Mint as MintEvent,
  Sync as SyncEvent,
  Flag as FlagEvent,
  Transfer as TransferEvent
} from "../generated/XRegistry/IXRegistry"

import {
  Nft,
  Invite
} from "../generated/schema"

export function handleMint(event: MintEvent): void {
  let entity = new Nft(event.params.tokenId.toString())
  entity.owner = event.params.owner
  entity.tba = event.params.tba
  entity.tokenId = event.params.tokenId
  entity.username = event.params.username
  entity.usernameLower = event.params.username.toLowerCase()
  entity.flag = BigInt.zero()
  entity.referrerCount = 0

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFlag(event: FlagEvent): void {
  let entity = Nft.load(event.params.tokenId.toString())
  if (entity == null) {
    log.error('failed load NFT by FlagEvent.tokenId: {}', [event.params.tokenId.toString()]);
    return;
  }
  entity.flag = event.params.flag;
  entity.save()
}

export function handleSync(event: SyncEvent): void {
  let entity = Nft.load(event.params.tokenId.toString())
  if (entity == null) {
    log.error('failed load NFT by SyncEvent.tokenId: {}', [event.params.tokenId.toString()]);
    return;
  }
  entity.owner = event.params.owner
  entity.username = event.params.username
  entity.usernameLower = event.params.username.toLowerCase()

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTransfer(event: TransferEvent): void {
  let entity = Nft.load(event.params.tokenId.toString())
  if (entity == null) {
    log.error('failed load NFT by TransferEvent.tokenId: {}', [event.params.tokenId.toString()]);
    return;
  }
  if (event.params.from.equals(Address.zero())) {
    return;
  }
  entity.owner = event.params.to

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInviteSend(event: InviteSendEvent): void {
  let entity = new Invite(event.params.toId.toString())
  entity.fromId = event.params.fromId
  entity.toId = event.params.toId
  entity.toUsername = ""; // cannot determin username now
  entity.accept = false;

  // FK:
  entity.tokenId = event.params.fromId.toString();

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInviteAccept(event: InviteAcceptEvent): void {
  const fromId = event.params.fromId.toString();
  const toId = event.params.toId.toString();
  let entity = Invite.load(toId)
  if (entity == null) {
    log.error('failed load NFT by InviteAcceptEvent.toId: {}', [event.params.toId.toString()]);
    return;
  }
  let toNft = Nft.load(toId);
  if (toNft != null) {
    entity.toUsername = toNft.username;
  }
  entity.accept = true;

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let fromNft = Nft.load(fromId);
  if (fromNft == null) {
    log.error('failed load NFT by InviteAcceptEvent.fromId: {}', [fromId]);
    return;
  }
  fromNft.referrerCount++;
  fromNft.save();
}
