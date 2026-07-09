type BrowserStorageName = 'localStorage' | 'sessionStorage';

function getStorage(name: BrowserStorageName): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window[name];
  } catch {
    return null;
  }
}

export function readStorage(
  name: BrowserStorageName,
  key: string,
): string | null {
  try {
    return getStorage(name)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorage(
  name: BrowserStorageName,
  key: string,
  value: string,
): boolean {
  try {
    const storage = getStorage(name);
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(
  name: BrowserStorageName,
  key: string,
): boolean {
  try {
    const storage = getStorage(name);
    if (!storage) return false;
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// 세션 스토리지 전용 얇은 래퍼 (후속 태스크에서 사용)
export function safeSessionGet(key: string): string | null {
  return readStorage('sessionStorage', key);
}

export function safeSessionSet(key: string, value: string): void {
  writeStorage('sessionStorage', key, value);
}
