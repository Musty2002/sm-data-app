export async function getEdgeFunctionErrorMessage(error: unknown): Promise<string | undefined> {
  if (!error || typeof error !== 'object') return undefined;

  const anyErr = error as any;

  // supabase-js FunctionsHttpError exposes the fetch Response on `context`
  const ctx = anyErr.context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.json();
      if (typeof body?.message === 'string') return body.message;
      if (typeof body?.error === 'string') return body.error;
      if (typeof body === 'string') return body;
      return JSON.stringify(body);
    } catch {
      // ignore
    }
  }

  const msg = anyErr.message;
  if (typeof msg === 'string') {
    // Sometimes error strings include a JSON payload at the end
    const match = msg.match(/\{[\s\S]*\}$/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (typeof parsed?.message === 'string') return parsed.message;
        if (typeof parsed?.error === 'string') return parsed.error;
      } catch {
        // ignore
      }
    }

    return msg;
  }

  return undefined;
}
