export interface MeecoItem {
  // classification types
  classifications: string[];

  // the label identifier for the type.
  label: string;

  // the meeco item id
  id: string;

  // the share identifier
  shareId?: string;
  ownerId: string;

  // is mine
  own: boolean;

  // the date the item was created
  created: Date;

  // the date the item was last modified
  modified: Date;

  // the values assigned
  values: MeecoItemValue[];

  // linked attachments
  attachments: MeecoAttachment[];
}

export interface MeecoItemValue {
  k: string;
  v: string;
}

export interface MeecoAttachment {
  name: string;
  id: string;
  mime: string;
  itemId: string;
  shareId?: string;
  own: boolean;
}
