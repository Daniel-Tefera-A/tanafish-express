"use client";
import React from "react";
import Link from "next/link";
import { Fish, Lock, X } from "lucide-react";
import { Button } from "./ui";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lake-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-lake-900 text-lime-400">
          <Fish size={24} />
        </div>

        <h3 className="font-display text-xl font-bold text-lake-900">
          Sign In Required
        </h3>
        
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Please sign in or create an account on <span className="font-semibold text-lake-900">FishLink</span> to place an order and arrange delivery across Bahir Dar.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link href="/auth" onClick={onClose} className="w-full">
            <Button size="lg" className="w-full flex items-center justify-center gap-2">
              <Lock size={16} /> Sign In / Create Account
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-full text-slate-500">
            Continue Browsing
          </Button>
        </div>
      </div>
    </div>
  );
}