/**
 * Shared Password Fields Component
 * Reusable password and confirm password fields for signup forms
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

interface PasswordFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  touchedFields?: Record<string, boolean>;
  showRequired?: boolean;
  checkTouched?: boolean;
}

export function PasswordFields({
  register,
  errors,
  touchedFields = {},
  showRequired = false,
  checkTouched = false,
}: PasswordFieldsProps) {
  const shouldShowPasswordError = checkTouched
    ? errors.password && touchedFields.password
    : errors.password;

  const shouldShowConfirmError = checkTouched
    ? errors.confirmPassword && touchedFields.confirmPassword
    : errors.confirmPassword;

  return (
    <>
      <div>
        <Label htmlFor="password">
          Password{showRequired && " *"}
        </Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          className="mt-1"
        />
        {shouldShowPasswordError && (
          <p className="text-sm text-red-600 mt-1" role="alert">
            {errors.password?.message as string}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">
          Confirm Password{showRequired && " *"}
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          className="mt-1"
          placeholder="Re-enter your password"
        />
        {shouldShowConfirmError && (
          <p className="text-sm text-red-600 mt-1" role="alert">
            {errors.confirmPassword?.message as string}
          </p>
        )}
      </div>
    </>
  );
}
