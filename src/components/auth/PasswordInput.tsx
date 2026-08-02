import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, type InputProps } from "@/components/ui/input";

interface PasswordInputProps extends Omit<InputProps, "type" | "iconSuffix"> {}

/**
 * Input mật khẩu có nút toggle hiện/ẩn.
 * Tự quản lý state show/hide, truyền iconSuffix cho Input.
 */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>((props, ref) => {
  const [show, setShow] = React.useState(false);

  return (
    <Input
      ref={ref}
      type={show ? "text" : "password"}
      iconSuffix={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="pointer-events-auto cursor-pointer"
          tabIndex={-1}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
      {...props}
    />
  );
});
PasswordInput.displayName = "PasswordInput";
