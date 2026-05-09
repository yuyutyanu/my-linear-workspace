import type { Href } from 'expo-router';

export type ParsedQrPayload = {
  href: Href;
  displayTarget: string;
};

export type QrPayloadParseResult =
  | {
      ok: true;
      value: ParsedQrPayload;
    }
  | {
      ok: false;
      message: string;
    };

type JsonObject = Record<string, unknown>;

const APP_SCHEMES = new Set(['mylinearworkspace']);
const SUPPORTED_PATHS = new Set(['/', '/details']);
const MAX_DECODE_DEPTH = 2;

export function parseQrPayload(rawData: unknown): QrPayloadParseResult {
  if (typeof rawData !== 'string') {
    return failure(
      'QRコードの読み取り結果にテキストデータが含まれていません。アプリ用QRコードを再生成してから再度お試しください。',
    );
  }

  const normalizedData = normalizePossiblyEncodedText(rawData);

  if (!normalizedData) {
    return failure(
      'QRコードのデータが空です。アプリ用のDeep LinkまたはPayloadを含むQRコードを使用してください。',
    );
  }

  const jsonResult = parseJsonPayload(normalizedData);
  if (jsonResult) {
    return jsonResult;
  }

  const urlResult = parseUrlLikePayload(normalizedData);
  if (urlResult) {
    return urlResult;
  }

  return failure(
    '対応していないQRコードです。mylinearworkspace://details などのアプリ用Deep Link、または route/path を含むJSON Payloadを使用してください。',
  );
}

function parseJsonPayload(data: string): QrPayloadParseResult | null {
  if (!data.startsWith('{')) {
    return null;
  }

  try {
    const parsed = JSON.parse(data) as unknown;

    if (!isJsonObject(parsed)) {
      return failure('QRコードのJSON Payloadがオブジェクトではありません。');
    }

    const nestedLink = firstStringValue(parsed, ['url', 'deepLink', 'link']);
    if (nestedLink) {
      const nestedResult = parseQrPayload(nestedLink);
      if (nestedResult.ok) {
        return nestedResult;
      }
    }

    const pathCandidate = firstStringValue(parsed, ['path', 'route', 'screen']);
    if (!pathCandidate) {
      return failure(
        'QRコードのJSON Payloadに遷移先がありません。url/deepLink/path/route のいずれかを含めてください。',
      );
    }

    return createHrefFromPath(pathCandidate, collectJsonParams(parsed));
  } catch {
    return failure(
      'QRコードのJSON Payloadを解析できませんでした。JSONの形式、URLエンコード、文字コードを確認してください。',
    );
  }
}

function parseUrlLikePayload(data: string): QrPayloadParseResult | null {
  const pathResult = parsePathPayload(data);
  if (pathResult) {
    return pathResult;
  }

  try {
    const url = new URL(data);

    const embeddedPayload = url.searchParams.get('payload') ?? url.searchParams.get('url');
    if (embeddedPayload) {
      const embeddedResult = parseQrPayload(embeddedPayload);
      if (embeddedResult.ok) {
        return embeddedResult;
      }
    }

    if (!isSupportedScheme(url.protocol)) {
      return failure(
        `対応していないDeep Linkスキームです（${url.protocol.replace(':', '')}）。アプリ用QRコードを使用してください。`,
      );
    }

    const routePath = APP_SCHEMES.has(url.protocol.replace(':', ''))
      ? normalizeRoutePath(`${url.hostname}${url.pathname}`)
      : normalizeRoutePath(url.pathname);
    return createHrefFromPath(routePath, Object.fromEntries(url.searchParams.entries()));
  } catch {
    return null;
  }
}

function parsePathPayload(data: string): QrPayloadParseResult | null {
  if (!data.startsWith('/') && !/^[A-Za-z0-9_-]+(?:\?|$)/.test(data)) {
    return null;
  }

  const pathUrl = new URL(data.startsWith('/') ? `app://local${data}` : `app://local/${data}`);
  return createHrefFromPath(pathUrl.pathname, Object.fromEntries(pathUrl.searchParams.entries()));
}

function createHrefFromPath(
  path: string,
  params: Record<string, string> = {},
): QrPayloadParseResult {
  const normalizedPath = normalizeRoutePath(path);

  if (!SUPPORTED_PATHS.has(normalizedPath)) {
    return failure(
      `QRコードの遷移先「${normalizedPath}」はこのアプリでサポートされていません。対応画面のQRコードか確認してください。`,
    );
  }

  const href: Href = Object.keys(params).length
    ? {
        pathname: normalizedPath as '/' | '/details',
        params,
      }
    : (normalizedPath as Href);

  return {
    ok: true,
    value: {
      href,
      displayTarget: normalizedPath,
    },
  };
}

function normalizePossiblyEncodedText(value: string) {
  let currentValue = value.trim().replace(/^\uFEFF/, '');

  for (let index = 0; index < MAX_DECODE_DEPTH; index += 1) {
    try {
      const decoded = decodeURIComponent(currentValue).trim();
      if (decoded === currentValue) {
        break;
      }
      currentValue = decoded;
    } catch {
      break;
    }
  }

  return currentValue;
}

function normalizeRoutePath(path: string) {
  const cleanPath = path.trim().replace(/^\/+/, '/').replace(/\/+$/, '');
  return cleanPath === '' ? '/' : cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
}

function isSupportedScheme(protocol: string) {
  const scheme = protocol.replace(':', '');
  return APP_SCHEMES.has(scheme) || protocol === 'https:' || protocol === 'http:';
}

function firstStringValue(payload: JsonObject, keys: string[]) {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return null;
}

function collectJsonParams(payload: JsonObject) {
  const params: Record<string, string> = {};

  for (const key of ['id', 'code', 'name']) {
    const value = payload[key];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      params[key] = String(value);
    }
  }

  for (const key of ['params', 'payload', 'data']) {
    const value = payload[key];
    if (!isJsonObject(value)) {
      continue;
    }

    for (const [paramKey, paramValue] of Object.entries(value)) {
      if (
        typeof paramValue === 'string' ||
        typeof paramValue === 'number' ||
        typeof paramValue === 'boolean'
      ) {
        params[paramKey] = String(paramValue);
      }
    }
  }

  return params;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function failure(message: string): QrPayloadParseResult {
  return {
    ok: false,
    message,
  };
}
