import { getFilaments, getPrinters, getProcesses } from "@/lib/profiles";
import { RelationsClient } from "./client";

export default function RelationsPage() {
  const filaments = getFilaments();
  const printers = getPrinters();
  const processes = getProcesses();

  return (
    <RelationsClient 
      filaments={filaments} 
      printers={printers} 
      processes={processes} 
    />
  );
}
