"use client";

import { useRef, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { logout } from "@/app/login/actions";
import { registerParticipant, type RegistrationState } from "./actions";

const initialState: RegistrationState = {};

export function RegistrationForm() {
  const [state, formAction, pending] = useActionState(registerParticipant, initialState);
  const [openingNext, setOpeningNext] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      {/* Success Modal */}
      {state.participant && !openingNext && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
        >
          <div className="success-popup surface max-w-md w-full p-8 text-center animate-scale-in">
            <div className="confetti" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <span key={index} />)}</div>
            <div className="success-check" aria-hidden="true">✓</div>
            <p className="eyebrow text-emerald-700 mb-2">Registration successful</p>
            <h2 className="text-2xl font-bold text-slate-900 mb-5">Participant registered!</h2>
            <div className="serial-circle">
              <span>Serial number</span>
              <strong>#{state.participant.serialNumber}</strong>
            </div>
            <p className="mt-5 text-lg font-semibold text-slate-900">{state.participant.name}</p>
            <p className="text-sm text-slate-600 mb-6">
              Please write this number on the participant&apos;s drawing sheet
            </p>
            <Link
              href="/volunteer?new=1"
              onClick={() => {
                if (openingNext) return;
                setOpeningNext(true);
                formRef.current?.reset();
              }}
              className={`primary-button block w-full text-center ${openingNext ? "is-processing" : ""}`}
            >
              {openingNext ? "Opening registration form..." : "Register Next Participant"}
            </Link>
          </div>
        </div>
      )}

      <form ref={formRef} action={formAction} noValidate className="surface space-y-5 p-6 sm:p-8">
        <div>
          <div className="form-heading">
            <h1 className="text-2xl font-bold text-slate-900">Register participant</h1>
            <button
              type="submit"
              formAction={logout}
              formNoValidate
              className="link-button"
            >
              Log out
            </button>
          </div>
        </div>

        {state.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}

        <label className="field-label">
          Name
          <input name="name" required maxLength={200} className="field-control" placeholder="Enter full name" />
        </label>
        <label className="field-label">
          Guardian name
          <input name="guardian_name" required maxLength={200} className="field-control" placeholder="Enter guardian full name" />
        </label>
        <label className="field-label">
          Contact number
          <input
            name="contact_number"
            required
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            pattern="[0-9]{10}"
            placeholder="10-digit mobile number"
            onInput={(event) => {
              event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 10);
            }}
            className="field-control"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="field-label">
            Age
            <input name="age" required type="number" min={3} max={100} className="field-control" placeholder="e.g. 10" />
          </label>
          <label className="field-label">
            Gender
            <select name="gender" required defaultValue="" className="field-control">
              <option value="" disabled>Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </label>
        </div>
        <label className="field-label">
          Address
          <textarea name="address" required maxLength={500} rows={2} className="field-control" placeholder="Enter full address" />
        </label>
        <label className="field-label">
          Registered by
          <input name="volunteer_name" required maxLength={200} className="field-control" placeholder="Enter volunteer name" />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {pending && (
            <svg className="h-5 w-5 animate-spin text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {pending ? "Registering..." : "Register participant"}
        </button>
      </form>
    </>
  );
}
