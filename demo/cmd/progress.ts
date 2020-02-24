import { sleep, printNewLine, clearLine } from "./util.ts";

const frame: string = "▓";
const backgroundFrame: string = "░";

class Progress {

  public async run(time: number = 1000, percent: number = 100, modulo: number = 2) {
    const count = Math.floor(percent / modulo);

    for (let i = 0; i < count; i ++) {
      await sleep(time / count);
      const progressLength = this._printProcess(i, count, modulo);
      if (i < count - 1) {
        clearLine(progressLength);
      }
    }
    printNewLine();
  }

  private _printProcess(index: number, count: number, modulo: number) {
    let progressLength: number = 0;
    for (let i = 0; i < count; i ++) {
      if (i <= index) {
        progressLength += this._print(frame);
      } else {
        progressLength += this._print(backgroundFrame);
      }
    }

    let percentNum: number = (index + 1) * modulo;
    percentNum = Math.min(100, percentNum);
    percentNum = Math.max(0, percentNum);
    progressLength += this._print(` ${percentNum}%`);
    return progressLength;
  }

  private _print(text: string, leftMoveCols?: number): number {
    const encode = new TextEncoder();
    let code: string = `\x1b[K${text}`;
    if (leftMoveCols! >= 0) {
      code = `\x1b[${leftMoveCols}D\x1b[K${text}`;
    }

    const chunk = encode.encode(`\x1b[K${text}`);
    Deno.stdout.writeSync(chunk);
    return chunk.length;
  }

}

const progress = new Progress();
progress.run(1000, 100);