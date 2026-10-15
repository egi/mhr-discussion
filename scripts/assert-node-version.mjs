// Guards the test/build precondition this project depends on:
// Uint8Array.prototype.toBase64/fromBase64, used starting in Plan 05-04's
// codec.sizing.test.ts and every later plan's shareLink.test.ts. Those methods do
// not exist below Node 24, and their absence otherwise surfaces as a cryptic
// "toBase64 is not a function" deep inside a codec test rather than as a clear
// runtime-version error here.

const NODE_FLOOR = 24;

const majorVersion = Number(process.versions.node.split('.')[0]);

if (Number.isNaN(majorVersion) || majorVersion < NODE_FLOOR) {
  process.stderr.write(
    `NODE_VERSION_PRECONDITION: this project requires Node >=${NODE_FLOOR} (active: ${process.version}). ` +
      `Run "nvm use ${NODE_FLOOR}" (or "nvm install ${NODE_FLOOR}" if it is not installed yet) before running tests or builds.\n`,
  );
  process.exit(1);
}
