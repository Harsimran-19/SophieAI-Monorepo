interface GeneratePdfOptions {
  margin?: number
  quality?: number
  scale?: number
}

export async function generateResumePdfBlob(
  contentId: string,
  options: GeneratePdfOptions = {}
): Promise<Blob> {
  const content = document.querySelector(`#${contentId}`)
  if (!content) {
    throw new Error("Resume content element not found")
  }

  const { margin = 0, quality = 0.98, scale = 2 } = options

  try {
    const html2pdf = (await import("html2pdf.js")).default
    const pdf = html2pdf()
      .from(content)
      .set({
        margin,
        image: { type: "jpeg", quality },
        html2canvas: { scale },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })

    // Get blob instead of saving
    const blob = await pdf.output("blob")
    return blob
  } catch (error) {
    console.error("Error generating PDF blob:", error)
    throw error
  }
}
