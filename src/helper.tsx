import { createContext, PropsWithChildren, useContext, useState } from "react";
import {
  DialogList,
  LaunchDialogFunction,
  LaunchNotificationFunction,
  NotificationList,
} from "./input-management-types";
import { ContextType, ProviderStateType } from "./operation-types";

const INITIAL_STATE = { dialog: null, notification: null };

const MS_PER_SECOND = 1000;

export interface ReactLauncherOptions<
  DIALOGS extends DialogList,
  NOTIFICATIONS extends NotificationList
> {
  dialogs?: DIALOGS;
  notifications?: NOTIFICATIONS;
}

export function createReactLauncher<
  DIALOGS extends DialogList,
  NOTIFICATIONS extends NotificationList
>({ dialogs, notifications }: ReactLauncherOptions<DIALOGS, NOTIFICATIONS>) {
  const context = createContext<ContextType<DIALOGS, NOTIFICATIONS>>({
    launchDialog: () => {},
    launchNotification: () => {},
  });

  const ReactLauncherProvider = ({ children }: PropsWithChildren) => {
    const [launchState, setLaunchState] =
      useState<ProviderStateType<DIALOGS, NOTIFICATIONS>>(INITIAL_STATE);

    const dialog =
      launchState.dialog !== null
        ? dialogs?.[launchState.dialog.key]
        : undefined;

    const dialogProps = {
      ...launchState.dialog?.params,
      onClick: () =>
        setLaunchState((current) => ({ ...current, dialog: null })),
    };

    const notification =
      launchState.notification !== null
        ? notifications?.[launchState.notification.key]
        : undefined;

    const launchDialog: LaunchDialogFunction<DIALOGS> = (key, params) => {
      setLaunchState((current) => ({ ...current, dialog: { key, params } }));
    };

    const launchNotification: LaunchNotificationFunction<NOTIFICATIONS> = (
      key,
      timeout,
      params
    ) => {
      setLaunchState((current) => ({
        ...current,
        notification: { key, params },
      }));

      setTimeout(() => {
        setLaunchState((current) => ({ ...current, notification: null }));
      }, timeout * MS_PER_SECOND);
    };

    return (
      <>
        {dialog !== undefined && dialog(dialogProps)}
        {notification !== undefined &&
          notification(launchState.notification?.params)}

        <context.Provider value={{ launchDialog, launchNotification }}>
          {children}
        </context.Provider>
      </>
    );
  };

  const useDialog = () => {
    const { launchDialog } = useContext(context);
    return launchDialog;
  };

  const useNotification = () => {
    const { launchNotification } = useContext(context);
    return launchNotification;
  };

  return {
    ReactLauncherProvider,
    useDialog,
    useNotification,
  };
}
