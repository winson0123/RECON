import { CircleCheck, CircleAlert, X } from "lucide-react"
import toast from "react-hot-toast"

export const Notification = {
  Error: "ERROR",
  Info: "INFO",
  Success: "SUCCESS",
} as const

type NotificationType = Uppercase<
  (typeof Notification)[keyof typeof Notification]
>

const getNotificationTypeClassnames = (type: NotificationType) => {
  switch (type) {
    case Notification.Error:
      return "text-error"
    case Notification.Info:
      return "text-info"
    case Notification.Success:
      return "text-success"
    default:
      return "text-info"
  }
}

const getBackgroundClassname = (type: NotificationType) => {
  switch (type) {
    case Notification.Error:
      return "from-error"
    case Notification.Info:
      return "from-info"
    case Notification.Success:
      return "from-success"
    default:
      return "from-info"
  }
}

interface NotificationMessage {
  notificationEmitter: string
  message: string
}

export interface NotificationProps {
  type: NotificationType
  message: NotificationMessage
}

export default function notification({
  type,
  message: { notificationEmitter, message },
}: NotificationProps) {
  toast.custom(
    (t) => (
      <div
        className={`max-w-[20%] ${
          t.visible
            ? "animate-[enter_200ms_ease-out]"
            : "animate-[leave_150ms_ease-in_forwards]"
        }`}
      >
        <div className="card bg-base-300">
          <div
            aria-hidden
            className={`card absolute -z-10 h-full w-full translate-y-[-2%] ${
              t.visible ? "animate-[bg-slide_4s_linear_forwards]" : ""
            } bg-gradient-to-r bg-right ${getBackgroundClassname(
              type
            )} to-base-300 from-50% to-50% bg-[length:200%_100%]`}
          />
          <div className="card-body z-0">
            <div className="flex justify-between">
              <h2
                className={`card-title text-base font-bold ${getNotificationTypeClassnames(
                  type
                )}`}
              >
                {" "}
                {notificationEmitter}
                {type === Notification.Error ? (
                  <CircleAlert className="h-6 w-6" />
                ) : (
                  <CircleCheck className="h-6 w-6" />
                )}
              </h2>
              <button
                type="button"
                className="btn btn-square btn-sm ml-4"
                onClick={() => {
                  toast.dismiss(t.id)
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="card-actions justify-end">
              <p className="text-sm tracking-tight text-gray-300">{message}</p>
            </div>
          </div>
        </div>
      </div>
    ),
    { duration: 4000 }
  )
}
