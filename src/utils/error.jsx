import { useNavigate } from "react-router-dom";
import { error_notify } from "../shared/notify/index.jsx";

export const Errors = (error) => {
  if (error) {
    if (error?.response) {
      let {
        status,
        data: { error: errormsg },
      } = error.response;

      if (error.response.data.error === "У вас нет такого права!") {
        setTimeout(() => {
          window.location.assign("/");
        }, 1000);
      }

      if (status === 403 || status === 400) {
        error_notify(errormsg);
      }

      if (status === 401) {
        error_notify(errormsg);
        localStorage.clear();
        setTimeout(() => {
          window.location.assign("/login");
        }, 1000);
      }

      return errormsg; // 💡 Shuni qo‘shish MUHIM
    } else if (error.request) {
      const msg = "Ошибка сети. Повторите попытку позже.";

      return msg;
    } else {
      const msg = "Произошла непредвиденная ошибка.";
      return msg;
    }
  }

  return "Неизвестная ошибка"; // fallback
};
