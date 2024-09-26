import { store } from "@/store";
import { Provider } from "react-redux";
import "@/assets/css/remixicon.css";
import "@/scss/style.scss";
import { UserProvider } from "@/context/UserContext";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <UserProvider>
        <Component {...pageProps} />
      </UserProvider>
    </Provider>
  );
}
