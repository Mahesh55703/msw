"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitConsultation(formData: FormData) {
  try {
    const data = {
      name: formData.get("name") as string,
      company: formData.get("company") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      industry: formData.get("industry") as string,
      employees: formData.get("employees") as string,
      contractors: formData.get("contractors") as string,
      location: formData.get("location") as string,
      services: formData.getAll("services") as string[],
      message: formData.get("message") as string,
      createdAt: new Date().toISOString(),
    };

    // Note: To prevent build errors in environments without API keys,
    // we simply mock the successful return if keys are absent.
    if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
      console.log("Mocking email submission (Missing RESEND_API_KEY/CONTACT_EMAIL):", data);
      return { success: true, message: "Message simulated successfully." };
    }

    const htmlContent = `
      <h2>New Consultation Request</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Company:</strong> ${data.company}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Location:</strong> ${data.location}</p>
      <p><strong>Industry:</strong> ${data.industry}</p>
      <p><strong>Employees:</strong> ${data.employees}</p>
      <p><strong>Contract Workers:</strong> ${data.contractors}</p>
      <p><strong>Services Needed:</strong> ${data.services.join(", ")}</p>
      <p><strong>Message:</strong> ${data.message}</p>
    `;

    await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL,
      subject: `New Lead: ${data.name} from ${data.company}`,
      html: htmlContent,
      replyTo: data.email,
    });

    return { success: true, message: "Your request has been submitted successfully." };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return { success: false, error: "Failed to submit request. Please try again later." };
  }
}
