// lib/api.ts
const API_BASE_URL = "http://localhost:3000/api"; // Replace with your API URL

export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  data?: any,
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "An error occurred");
  }

  return response.json();
}
