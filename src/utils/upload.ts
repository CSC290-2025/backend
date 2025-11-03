import * as fs from 'node:fs';
import {
  createZiplineClient,
  type UploadResponse,
} from '@ttwrpz/zipline-client';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime';

type GroupId =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16;

const client = createZiplineClient({
  baseUrl: process.env.ZIPLINE_URL!,
  token: process.env.ZIPLINE_TOKEN!,
});

const groupFolderId: Record<GroupId, string> = {
  0: 'cmhij0gaq003c01o1o1lsozmt',
  1: 'cmhhph7tm002301o1so9m65fv',
  2: 'cmhhphbb2002401o16aaif2wg',
  3: 'cmhhphe8e002501o19fb9aq4f',
  4: 'cmhhphgtw002601o1l92123nh',
  5: 'cmhhphe8e002501o19fb9aq4f',
  6: 'cmhhphmeu002801o1jaf8ma9i',
  7: 'cmhhphpit002901o18kkusxj8',
  8: 'cmhhphs2z002a01o1vbqd78bq',
  9: 'cmhhphuys002b01o1j1q1493l',
  10: 'cmhhphy2t002c01o16lrwxk5s',
  11: 'cmhhpi2md002d01o1osm9gk1e',
  12: 'cmhhpi5ob002e01o1p5rdihwx',
  13: 'cmhhpi86s002f01o1tov8hg5h',
  14: 'cmhhpiav8002g01o1zif1mxrq',
  15: 'cmhhpidfr002h01o1sw8jyv1g',
  16: 'cmhhpig0u002i01o1j0j2npua',
};

type UploadInput = { filePath: string } | { fileBlob: Blob } | { file: File };

async function uploadFile(input: UploadInput, groupId: GroupId) {
  let blob: Blob;
  let filename: string;

  if ('filePath' in input) {
    const buffer = fs.readFileSync(input.filePath);
    filename = input.filePath.split('/').pop() || 'file.bin';
    const mimeType = mime.getType(filename) || 'application/octet-stream';
    blob = new Blob([buffer], { type: mimeType });
  } else if ('fileBlob' in input) {
    blob = input.fileBlob;
    filename = 'upload.bin';
  } else {
    blob = input.file;
    filename = input.file.name;
  }

  const folderId = groupFolderId[groupId];

  const response = await client.uploadFiles([blob], {
    format: 'random',
    filename: `${uuidv4()}-${filename}`,
    folderId,
  });

  return {
    id: (response as UploadResponse).files[0].id,
    url: (response as UploadResponse).files[0].url,
  };
}

async function deleteUploadFile(fileId: string) {
  await client.deleteFile(fileId);
}

export { uploadFile, deleteUploadFile };
