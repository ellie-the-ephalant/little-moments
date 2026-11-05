const FONT_TIMEOUT_MS = 3000;

function waitForFonts(promise: Promise<unknown>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise.then(
      () => true,
      () => false,
    ),
    new Promise<boolean>((resolve) => {
      timer = setTimeout(() => resolve(false), FONT_TIMEOUT_MS);
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function ensureFonts() {
  if (typeof document === "undefined" || !document.fonts) return false;

  try {
    const loaded = await waitForFonts(
      Promise.all([
        document.fonts.load('600 40px "Fraunces Variable"'),
        document.fonts.load('italic 600 40px "Fraunces Variable"'),
        document.fonts.load('600 14px "Manrope Variable"'),
      ]),
    );
    return loaded ? waitForFonts(document.fonts.ready) : false;
  } catch {
    return false;
  }
}
