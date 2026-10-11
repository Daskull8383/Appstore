import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  useClerk,
  useUser,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { ruRU } from "@clerk/localizations";
import {
  getStorefrontState,
  saveStorefrontState,
  type StorefrontState,
  type StorefrontStateInput,
} from "@workspace/api-client-react";
import { LogOut, RefreshCw, UserRound } from "lucide-react";
import {
  Route,
  Router as WouterRouter,
  Switch,
  useLocation,
} from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: "simple" as const,
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#181a22",
    colorForeground: "#171923",
    colorMutedForeground: "#697181",
    colorDanger: "#bd3742",
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorInputForeground: "#171923",
    colorNeutral: "#d8dce5",
    fontFamily: "Fredoka, -apple-system, BlinkMacSystemFont, sans-serif",
    borderRadius: "1rem",
  },
  elements: {
    rootBox: {
      width: "100%",
      display: "flex",
      justifyContent: "center",
    },
    cardBox: {
      width: "440px",
      maxWidth: "100%",
      overflow: "hidden",
      backgroundColor: "#ffffff",
      border: "1px solid #e8ebf2",
      borderRadius: "24px",
      boxShadow: "0 24px 70px rgba(41, 47, 70, 0.14)",
    },
    card: {
      backgroundColor: "transparent",
      border: "0",
      borderRadius: "0",
      boxShadow: "none",
    },
    footer: {
      backgroundColor: "transparent",
      border: "0",
      boxShadow: "none",
    },
    headerTitle: {
      color: "#171923",
      fontFamily: "Fredoka, sans-serif",
      fontSize: "27px",
      fontWeight: "600",
    },
    headerSubtitle: {
      color: "#687080",
      fontFamily: "Fredoka, sans-serif",
    },
    formFieldLabel: {
      color: "#252935",
      fontFamily: "Fredoka, sans-serif",
    },
    formFieldInput: {
      color: "#171923",
      backgroundColor: "#ffffff",
      border: "1px solid #d8dce5",
      borderRadius: "12px",
      fontFamily: "Fredoka, sans-serif",
    },
    formButtonPrimary: {
      color: "#ffffff",
      backgroundColor: "#181a22",
      borderRadius: "999px",
      fontFamily: "Fredoka, sans-serif",
      fontWeight: "500",
    },
    socialButtonsBlockButton: {
      backgroundColor: "#ffffff",
      border: "1px solid #d8dce5",
      borderRadius: "12px",
    },
    socialButtonsBlockButtonText: {
      color: "#252935",
      fontFamily: "Fredoka, sans-serif",
      fontWeight: "500",
    },
    footerAction: {
      backgroundColor: "transparent",
    },
    footerActionText: {
      color: "#687080",
      fontFamily: "Fredoka, sans-serif",
    },
    footerActionLink: {
      color: "#303b57",
      fontFamily: "Fredoka, sans-serif",
      fontWeight: "500",
    },
    dividerText: {
      color: "#747987",
      fontFamily: "Fredoka, sans-serif",
    },
    dividerLine: {
      backgroundColor: "#e5e8ef",
    },
    alert: {
      backgroundColor: "#fff5f5",
      border: "1px solid #f1cccc",
      borderRadius: "12px",
    },
    alertText: {
      color: "#9c2832",
      fontFamily: "Fredoka, sans-serif",
    },
    formFieldSuccessText: {
      color: "#227044",
      fontFamily: "Fredoka, sans-serif",
    },
    identityPreviewEditButton: {
      color: "#303b57",
    },
    logoBox: {
      borderRadius: "50%",
    },
    logoImage: {
      borderRadius: "50%",
    },
    otpCodeFieldInput: {
      color: "#171923",
      backgroundColor: "#ffffff",
      border: "1px solid #d8dce5",
      borderRadius: "10px",
    },
    formFieldRow: {
      marginBottom: "14px",
    },
    main: {
      fontFamily: "Fredoka, sans-serif",
    },
  },
};

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function applyStorefrontState(state: StorefrontStateInput) {
  window.dispatchEvent(
    new CustomEvent("appstore:apply-account-state", { detail: state }),
  );
}

function readLocalState(): StorefrontStateInput {
  const read = <T,>(key: string, fallback: T): T => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "null") as T | null;
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const cart = read<StorefrontStateInput["cart"]>("appstore-cart", []);
  const favorites = read<string[]>("appstore-favorites", []);
  return {
    cart: Array.isArray(cart)
      ? cart.filter(
          (item) =>
            item &&
            typeof item.name === "string" &&
            Number.isInteger(item.qty) &&
            item.qty > 0,
        )
      : [],
    favorites: Array.isArray(favorites)
      ? favorites.filter((name) => typeof name === "string")
      : [],
  };
}

function readGuestSnapshot(): StorefrontStateInput | null {
  try {
    const cart = localStorage.getItem("appstore-guest-cart");
    const favorites = localStorage.getItem("appstore-guest-favorites");
    if (cart === null || favorites === null) return null;
    return {
      cart: JSON.parse(cart) as StorefrontStateInput["cart"],
      favorites: JSON.parse(favorites) as string[],
    };
  } catch {
    return null;
  }
}

function saveGuestSnapshot(state: StorefrontStateInput) {
  try {
    localStorage.setItem("appstore-guest-cart", JSON.stringify(state.cart));
    localStorage.setItem(
      "appstore-guest-favorites",
      JSON.stringify(state.favorites),
    );
  } catch {
    // Keep guest state in memory when browser storage is unavailable.
  }
}

function AuthRouteFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add("auth-route");
    return () => document.body.classList.remove("auth-route");
  }, []);

  return (
    <main className="auth-page">
      <a className="auth-back-link" href={`${basePath}/`}>
        ← Вернуться в магазин
      </a>
      <div className="auth-brand">
        <img src={`${basePath}/logo.svg`} alt="" />
        <span>APP STORE</span>
      </div>
      <p className="auth-intro">
        Войдите или создайте аккаунт, чтобы сохранить избранное и корзину.
      </p>
      {children}
    </main>
  );
}

function SignInPage() {
  return (
    <AuthRouteFrame>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </AuthRouteFrame>
  );
}

function SignUpPage() {
  return (
    <AuthRouteFrame>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </AuthRouteFrame>
  );
}

function AccountWidget() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const accountUserId = user?.id ?? null;
  const guestSnapshot = useRef<StorefrontStateInput | null>(null);
  const activeUserId = useRef<string | null>(null);
  const syncReady = useRef(false);
  const syncTimer = useRef<number | undefined>(undefined);
  const latestState = useRef<StorefrontStateInput | null>(null);
  const syncErrorKind = useRef<"load" | "save" | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!accountUserId) {
      if (activeUserId.current) {
        syncReady.current = false;
        window.clearTimeout(syncTimer.current);
        if (guestSnapshot.current) applyStorefrontState(guestSnapshot.current);
        activeUserId.current = null;
        latestState.current = null;
        syncErrorKind.current = null;
        setSyncMessage("");
      } else if (!guestSnapshot.current) {
        guestSnapshot.current = readGuestSnapshot() ?? readLocalState();
        saveGuestSnapshot(guestSnapshot.current);
        applyStorefrontState(guestSnapshot.current);
      }
      return;
    }

    if (activeUserId.current && activeUserId.current !== accountUserId) {
      syncReady.current = false;
      window.clearTimeout(syncTimer.current);
      if (guestSnapshot.current) applyStorefrontState(guestSnapshot.current);
    }
    if (!guestSnapshot.current) {
      guestSnapshot.current = readGuestSnapshot() ?? readLocalState();
      saveGuestSnapshot(guestSnapshot.current);
    }

    const localState = guestSnapshot.current;
    activeUserId.current = accountUserId;
    syncReady.current = false;
    latestState.current = localState;
    syncErrorKind.current = "load";
    setSyncMessage("Загружаем сохранённые данные…");
    let current = true;

    void getStorefrontState({ credentials: "include" })
      .then(async (saved: StorefrontState) => {
        if (!current || activeUserId.current !== accountUserId) return;
        if (saved.isNew) {
          applyStorefrontState(localState);
          await saveStorefrontState(localState, { credentials: "include" });
        } else {
          const remoteState = {
            cart: saved.cart,
            favorites: saved.favorites,
          };
          latestState.current = remoteState;
          applyStorefrontState(remoteState);
        }
        if (!current || activeUserId.current !== accountUserId) return;
        syncReady.current = true;
        syncErrorKind.current = null;
        setSyncMessage("Корзина и избранное синхронизированы.");
      })
      .catch(() => {
        if (!current || activeUserId.current !== accountUserId) return;
        syncReady.current = false;
        syncErrorKind.current = "load";
        setSyncMessage("Не удалось загрузить сохранённые данные.");
      });

    return () => {
      current = false;
    };
  }, [accountUserId, isLoaded, retryCount]);

  useEffect(() => {
    if (!isLoaded || !accountUserId) return;

    const handleStateChange = (event: Event) => {
      const state = (event as CustomEvent<StorefrontStateInput>).detail;
      if (
        !state ||
        !syncReady.current ||
        activeUserId.current !== accountUserId
      ) {
        return;
      }
      latestState.current = state;
      syncErrorKind.current = "save";
      setSyncMessage("Сохраняем изменения…");
      window.clearTimeout(syncTimer.current);
      syncTimer.current = window.setTimeout(() => {
        void saveStorefrontState(state, { credentials: "include" })
          .then(() => {
            if (activeUserId.current !== accountUserId) return;
            syncErrorKind.current = null;
            setSyncMessage("Изменения сохранены.");
          })
          .catch(() => {
            if (activeUserId.current !== accountUserId) return;
            syncErrorKind.current = "save";
            setSyncMessage("Не удалось сохранить изменения.");
          });
      }, 450);
    };

    window.addEventListener("appstore:state-change", handleStateChange);
    return () => {
      window.removeEventListener("appstore:state-change", handleStateChange);
      window.clearTimeout(syncTimer.current);
    };
  }, [accountUserId, isLoaded]);

  useEffect(() => {
    if (!isLoaded || accountUserId) return;

    const handleGuestStateChange = (event: Event) => {
      const state = (event as CustomEvent<StorefrontStateInput>).detail;
      if (!state) return;
      guestSnapshot.current = state;
      saveGuestSnapshot(state);
    };

    window.addEventListener("appstore:state-change", handleGuestStateChange);
    return () =>
      window.removeEventListener(
        "appstore:state-change",
        handleGuestStateChange,
      );
  }, [accountUserId, isLoaded]);

  const retrySync = () => {
    if (syncErrorKind.current === "load") {
      setRetryCount((current) => current + 1);
      return;
    }
    if (!accountUserId || !latestState.current) return;
    const state = latestState.current;
    setSyncMessage("Сохраняем изменения…");
    void saveStorefrontState(state, { credentials: "include" })
      .then(() => {
        if (activeUserId.current !== accountUserId) return;
        syncReady.current = true;
        syncErrorKind.current = null;
        setSyncMessage("Изменения сохранены.");
      })
      .catch(() => setSyncMessage("Не удалось сохранить изменения."));
  };

  if (!isLoaded) {
    return (
      <button className="action account-trigger" type="button" disabled aria-label="Загрузка аккаунта">
        <UserRound size={17} aria-hidden="true" />
      </button>
    );
  }

  const displayName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || "Аккаунт";

  return (
    <div className="account-widget">
      <button
        className="action account-trigger"
        type="button"
        aria-label={isSignedIn ? `Аккаунт: ${displayName}` : "Аккаунт"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <UserRound size={17} aria-hidden="true" />
        <span className="action-label">{isSignedIn ? "Аккаунт" : "Войти"}</span>
      </button>
      {menuOpen && (
        <div className="account-popover" role="dialog" aria-label="Аккаунт">
          {isSignedIn ? (
            <>
              <strong className="account-popover-name">{displayName}</strong>
              <p className="account-sync-status" role="status">
                {syncMessage || "Ваши данные сохраняются в аккаунте."}
              </p>
              {syncErrorKind.current && (
                <button
                  className="account-menu-button account-retry"
                  type="button"
                  onClick={retrySync}
                >
                  <RefreshCw size={15} aria-hidden="true" />
                  Повторить
                </button>
              )}
              <button
                className="account-menu-button"
                type="button"
                onClick={() => void signOut({ redirectUrl: basePath || "/" })}
              >
                <LogOut size={16} aria-hidden="true" />
                Выйти
              </button>
            </>
          ) : (
            <>
              <strong className="account-popover-name">Ваш APP STORE</strong>
              <p className="account-sync-status">
                Сохраняйте избранное и корзину в личном аккаунте.
              </p>
              <a className="account-menu-button account-primary" href={`${basePath}/sign-in`}>
                Войти
              </a>
              <a className="account-menu-button" href={`${basePath}/sign-up`}>
                Создать аккаунт
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AuthenticatedApp() {
  const accountSlot = document.getElementById("account-root");

  return (
    <>
      {accountSlot && createPortal(<AccountWidget />, accountSlot)}
      <Switch>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
      </Switch>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={clerkProxyUrl}
        appearance={clerkAppearance}
        signInUrl={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        routerPush={(to) => setLocation(stripBase(to))}
        routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
        localization={{
          ...ruRU,
          signIn: {
            ...ruRU.signIn,
            start: {
              ...ruRU.signIn?.start,
              title: "Войдите в APP STORE",
              subtitle: "Сохраните избранное и корзину в личном аккаунте.",
            },
          },
          signUp: {
            ...ruRU.signUp,
            start: {
              ...ruRU.signUp?.start,
              title: "Создайте аккаунт APP STORE",
              subtitle: "Корзина и избранное будут доступны на всех устройствах.",
            },
          },
        }}
    >
      <AuthenticatedApp />
    </ClerkProvider>
  );
}

export function AuthShell() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
