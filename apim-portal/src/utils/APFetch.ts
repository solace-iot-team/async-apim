

export const fetchWithTimeout = async(resource: string, timeout_ms: number): Promise<Response> =>  {

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout_ms);

  const response = await window.fetch(resource, {
    signal: controller.signal  
  });
  clearTimeout(id);
  return response;
}