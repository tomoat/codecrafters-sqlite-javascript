import { open } from "fs/promises";

const databaseFilePath = process.argv[2];
const command = process.argv[3];

if (command === ".dbinfo") {
  const databaseFileHandler = await open(databaseFilePath, "r");

  const { buffer } = await databaseFileHandler.read({
    length: 100,
    position: 0,
    buffer: Buffer.alloc(100),
  });

  // You can use print statements as follows for debugging, they'll be visible when running tests.
  // console.log("Logs from your program will appear here!");

  // Uncomment this to pass the first stage
  const pageSize = buffer.readUInt16BE(16); // page size is 2 bytes starting at offset 16
  console.log(`database page size: ${pageSize}`);

  // buffer.readUInt16BE（16）从缓冲区中读取页面大小，console.log将其打印出来。if语句检查页面大小是否小于112（标头为100，最小所需数据为12），如果小于，则抛出错误。
  if (pageSize < 100 + 12) {
    throw `PageSize too mall to contain headers`
  }

  // 添加的代码行负责从数据库文件中读取sqlite_schema表头，并提取数据库中的表（单元格）数量。
  // 首先，代码将从文件的第100个字节开始的8个字节读取到sqliteSchemaHeader中。这就是sqlite_schema表头所在的位置。
  const { buffer: sqliteSchemaHeader } = await databaseFileHandler.read({
    length: 8,
    position: 100,
    buffer: Buffer.alloc(8)
  })

  // 然后，它从sqliteSchemaHeader的第3个字节读取单元格（表）的数量，并将其记录到控制台。
  const numCells = sqliteSchemaHeader.readUInt16BE(3)
  console.log(`number of tables: ${numCells}`)

  await databaseFileHandler.close()
} else {
  throw `Unknown command ${command}`;
}
