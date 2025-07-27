import { api } from "encore.dev/api";

export const world = api(
  { method: "GET", path: "/hello/:name", expose: true },
  async ({ name }: { name: string }): Promise<Response> => {
    return { message: `Hello ${name}!` };
  },
);

interface Response {
  message: string;
}
