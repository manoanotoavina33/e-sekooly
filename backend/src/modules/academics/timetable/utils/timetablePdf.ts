import PDFDocument from "pdfkit";
import { Response } from "express";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lundi",
  TUESDAY: "Mardi",
  WEDNESDAY: "Mercredi",
  THURSDAY: "Jeudi",
  FRIDAY: "Vendredi",
  SATURDAY: "Samedi",
};

interface SlotForPdf {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  subject: { name: string };
  classRoom: { name: string };
  teacher: { user: { firstName: string; lastName: string } };
}

/**
 * Génère un PDF imprimable de l'emploi du temps et l'envoie directement dans
 * la réponse HTTP. Répond à l'exigence "Impression / Export PDF" du planning.
 */
export function streamTimetablePdf(res: Response, title: string, slots: SlotForPdf[]) {
  const doc = new PDFDocument({ margin: 36, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="emploi-du-temps.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).fillColor("#125597").text("e-sekooly", { continued: false });
  doc.fontSize(14).fillColor("#0f172a").text(title, { paragraphGap: 12 });
  doc.moveDown(0.5);

  const grouped = new Map<string, SlotForPdf[]>();
  for (const slot of slots) {
    const list = grouped.get(slot.dayOfWeek) ?? [];
    list.push(slot);
    grouped.set(slot.dayOfWeek, list);
  }

  for (const day of ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]) {
    const daySlots = (grouped.get(day) ?? []).sort((a, b) => a.startTime.localeCompare(b.startTime));
    if (daySlots.length === 0) continue;

    doc.fontSize(12).fillColor("#2389DE").text(DAY_LABELS[day], { underline: true });
    doc.moveDown(0.2);

    daySlots.forEach((slot) => {
      const teacherName = `${slot.teacher.user.firstName} ${slot.teacher.user.lastName}`;
      doc
        .fontSize(10)
        .fillColor("#0f172a")
        .text(
          `${slot.startTime} - ${slot.endTime}   ${slot.subject.name}   (${slot.classRoom.name})   ${teacherName}${
            slot.room ? "   Salle " + slot.room : ""
          }`
        );
    });
    doc.moveDown(0.6);
  }

  doc.end();
}
