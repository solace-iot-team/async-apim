
import base64 from 'base-64';

export const fetchWithTimeoutAndRandomBasicAuth = async(resource: string, timeout_ms: number): Promise<Response> =>  {

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout_ms);

  const headers = new Headers({
    "Authorization": `Basic ${base64.encode('u:p')}`
  });
  const response = await window.fetch(resource, {
    headers: headers,
    signal: controller.signal  
  });
  clearTimeout(id);
  return response;
}