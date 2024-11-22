import ky from "ky";

export const kyInstance = ky.extend({
  retry: 0,
  hooks: {
    beforeError: [
      async (error) => {
        const { response } = error;
        if (response) {
          if (!response.url.endsWith("login") && response.status === 401) {
            error.message = "Sessão expirada, faça login novamente";
          } else {
            const { mensagem } = await response.json<{ mensagem: string }>();
            error.message = mensagem;
          }
        }
        return error;
      },
    ],
  },
});
