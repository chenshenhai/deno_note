import { sleep, printNewLine } from "./util.ts";


class Loading {
  private _intervalId: number = -1;
  private _beforeLength: number = 0;
  private _isDuringLoading: boolean = false;
  private _loadingIndex = 0;

  public start(speed: number = 100) {
    if (this._isDuringLoading === true) {
      return;
    }
    this._intervalId = setInterval(() => {
      this._printLoadingText();
    }, speed);
    this._isDuringLoading = true;
  }

  public stop() {
    clearInterval(this._intervalId);
    printNewLine();
    this._isDuringLoading = false;
    this._loadingIndex = 0;
  }

  private _printLoadingText() {
    const max = 10;
    if (this._loadingIndex >= max) {
      this._loadingIndex = 0;
    }
    const charList = [];
    for (let i = 0; i < max; i++) {
      if (i === this._loadingIndex) {
        charList.push('==>');
      } else {
        charList.push(' ');
      }
    }
    
    const loadingText: string = [...['['], ...charList, ...[']']].join('');
    this._print(loadingText);
    this._loadingIndex += 1;
  }

  private _print(text: string): void {
    const encode = new TextEncoder();
    const chunk = encode.encode(`\x1b[${this._beforeLength}D \x1b[K ${text}`);
    Deno.stdout.writeSync(chunk);
    this._beforeLength = chunk.length;
  }
}

async function main() {
  const loading = new Loading();
  loading.start();
  await sleep(2000);
  loading.stop();
}

main();
