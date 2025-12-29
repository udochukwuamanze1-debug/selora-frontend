import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  doctorName: string;
  doctorEmail?: string;
  walletAddress: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-verification-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doctorName, doctorEmail, walletAddress }: VerificationEmailRequest = await req.json();
    
    console.log(`Sending verification email for doctor: ${doctorName}, email: ${doctorEmail}`);

    // If we have an email, send the notification
    if (doctorEmail && RESEND_API_KEY) {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Your profile has been verified</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">
                Dear Dr. ${doctorName},
              </p>
              
              <p style="color: #6b7280; line-height: 1.6;">
                Great news! Your Selora doctor profile has been verified. You are now visible in the Care Network, and patients can find and request appointments with you.
              </p>
              
              <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #166534; margin: 0; font-weight: 500;">
                  ✓ Profile visible in Care Network<br>
                  ✓ Patients can send appointment requests<br>
                  ✓ Access to full doctor portal features
                </p>
              </div>
              
              <p style="color: #6b7280; line-height: 1.6;">
                Log in to your Selora account to start managing patient requests and grow your practice.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://tryselora.vercel.app" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                  Go to Selora
                </a>
              </div>
            </div>
            
            <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                Selora - Decentralized Healthcare on Sui<br>
                Wallet: ${walletAddress.slice(0, 10)}...${walletAddress.slice(-6)}
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Selora <onboarding@resend.dev>",
          to: [doctorEmail],
          subject: "Your Selora Profile Has Been Verified!",
          html: emailHtml,
        }),
      });

      const emailData = await emailResponse.json();
      console.log("Email response:", emailData);

      if (!emailResponse.ok) {
        throw new Error(emailData.message || "Failed to send email");
      }

      return new Response(JSON.stringify({ success: true, emailData }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // If no email or no API key, just log the verification
    console.log(`Doctor ${doctorName} verified but no email sent (email: ${doctorEmail}, hasKey: ${!!RESEND_API_KEY})`);
    return new Response(JSON.stringify({ success: true, message: "Verified but no email to send" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
