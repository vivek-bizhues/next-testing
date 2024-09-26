import { store } from "@/store";
import { Provider } from "react-redux";
import "@/assets/css/remixicon.css";
import "@/scss/style.scss";
import { UserProvider } from "@/context/UserContext";
import Layout from "@/layouts/Layout";
import "@silevis/reactgrid/styles.css";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <UserProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </UserProvider>
    </Provider>
  );
}
