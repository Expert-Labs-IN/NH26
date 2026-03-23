import React, { createContext, useContext, useState } from "react";
import { X } from "lucide-react";

type SheetContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = createContext<SheetContextType | null>(null);

export function Sheet({ 
  children, 
  open: controlledOpen, 
  onOpenChange 
}: { 
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ children }: { children: React.ReactNode }) {
  const context = useContext(SheetContext);
  if (!context) return null;

  const { setOpen } = context;

  return (
    <div onClick={() => setOpen(true)} className="cursor-pointer">
      {children}
    </div>
  );
}

export function SheetClose({ children }: { children: React.ReactNode }) {
  const context = useContext(SheetContext);
  if (!context) return null;

  const { setOpen } = context;

  return (
    <div onClick={() => setOpen(false)} className="cursor-pointer">
      {children}
    </div>
  );
}

export function SheetContent({
  children,
  side = "right",
  className = "",
}: {
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
}) {
  const context = useContext(SheetContext);
  if (!context) return null;

  const { open, setOpen } = context;

  if (!open) return null;

  const sideClass = side === "left" ? "left-0" : "right-0";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div className={`fixed ${sideClass} top-0 h-full w-80 bg-white shadow-lg z-50 p-6 flex flex-col ${className}`}>
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4"
        >
          <X className="w-5 h-5" />
        </button>

        {children}
      </div>
    </>
  );
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function SheetFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-auto pt-4">{children}</div>;
}

export function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function SheetDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500">{children}</p>;
}
