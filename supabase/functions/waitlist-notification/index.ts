import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAILS = ["customer.selora@gmail.com", "officialsammy61@gmail.com"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistEntry {
  id: string;
  email: string;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  created_at: string;
}

interface WaitlistRequest {
  email: string;
  referral_code: string;
  referred_by?: string;
}

function generateCSV(entries: WaitlistEntry[]): string {
  const headers = ["Email", "Referral Code", "Referred By", "Referral Count", "Signed Up At"];
  const rows = entries.map(entry => [
    entry.email,
    entry.referral_code,
    entry.referred_by || "Direct",
    entry.referral_count.toString(),
    new Date(entry.created_at).toLocaleString()
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(","))
    .join("\n");
  
  return csvContent;
}

async function sendSpreadsheetToAdmins(entries: WaitlistEntry[], newSignup: string) {
  const csvContent = generateCSV(entries);
  const totalCount = entries.length;
  const today = new Date().toLocaleDateString();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .stat-box { background: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center; }
        .stat-number { font-size: 48px; font-weight: bold; color: #10b981; }
        .stat-label { color: #6b7280; font-size: 14px; }
        .new-signup { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; color: #374151; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }
        .badge-new { background: #d1fae5; color: #065f46; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New Selora Waitlist Signup!</h1>
        </div>
        <div class="content">
          <div class="stat-box">
            <div class="stat-number">${totalCount}</div>
            <div class="stat-label">Total Waitlist Signups</div>
          </div>
          
          <div class="new-signup">
            <strong>New signup:</strong> ${newSignup}
            <span class="badge badge-new">Just now</span>
          </div>
          
          <p>The attached CSV contains the complete waitlist data. Here are the most recent signups:</p>
          
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Referrals</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              ${entries.slice(0, 10).map(entry => `
                <tr>
                  <td>${entry.email}</td>
                  <td>${entry.referral_count}</td>
                  <td>${entry.referred_by ? `Referral` : 'Direct'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="footer">
          <p>Selora Health • ${today}</p>
          <p>This is an automated notification.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send to admin emails
  for (const adminEmail of ADMIN_EMAILS) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Selora Waitlist <onboarding@resend.dev>",
          to: [adminEmail],
          subject: `📊 New Waitlist Signup: ${newSignup} (Total: ${totalCount})`,
          html: htmlContent,
          attachments: [
            {
              filename: `selora-waitlist-${today.replace(/\//g, '-')}.csv`,
              content: btoa(csvContent),
            }
          ],
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to send to ${adminEmail}:`, error);
      } else {
        console.log(`Spreadsheet sent to admin: ${adminEmail}`);
      }
    } catch (error) {
      console.error(`Failed to send to ${adminEmail}:`, error);
    }
  }
}

async function notifyReferrer(referrerEmail: string, referrerCode: string, newReferralCount: number, referredEmail: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; text-align: center; }
        .stat-box { background: #f5f3ff; border-radius: 12px; padding: 25px; margin: 20px 0; }
        .stat-number { font-size: 56px; font-weight: bold; color: #7c3aed; }
        .stat-label { color: #6b7280; font-size: 14px; margin-top: 5px; }
        .message { color: #374151; line-height: 1.6; margin: 20px 0; }
        .cta { display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
        .confetti { font-size: 40px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="confetti">🎊</div>
          <h1>Someone Used Your Link!</h1>
        </div>
        <div class="content">
          <div class="stat-box">
            <div class="stat-number">${newReferralCount}</div>
            <div class="stat-label">Total Referrals</div>
          </div>
          
          <p class="message">
            Great news! Someone just signed up for the Selora waitlist using your referral link. 
            You're climbing up the priority list!
          </p>
          
          <p class="message" style="font-size: 14px; color: #6b7280;">
            Keep sharing your link to get early access when we launch.
          </p>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
            Your referral code: <strong>${referrerCode}</strong>
          </p>
        </div>
        <div class="footer">
          <p>Selora Health</p>
          <p>You're receiving this because someone used your referral link.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Selora <onboarding@resend.dev>",
        to: [referrerEmail],
        subject: `🎉 You got a new referral! (${newReferralCount} total)`,
        html: htmlContent,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to notify referrer ${referrerEmail}:`, error);
    } else {
      console.log(`Referral notification sent to: ${referrerEmail}`);
    }
  } catch (error) {
    console.error(`Failed to notify referrer ${referrerEmail}:`, error);
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { email, referral_code, referred_by }: WaitlistRequest = await req.json();
    
    console.log(`Processing waitlist signup: ${email}, referred_by: ${referred_by || 'none'}`);

    // Get all waitlist entries for the spreadsheet
    const { data: allEntries, error: fetchError } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching waitlist:", fetchError);
      throw fetchError;
    }

    // Send spreadsheet to admins
    await sendSpreadsheetToAdmins(allEntries || [], email);

    // If there's a referrer, notify them
    if (referred_by) {
      // Find the referrer's email and updated count
      const { data: referrer, error: referrerError } = await supabase
        .from("waitlist")
        .select("email, referral_code, referral_count")
        .eq("referral_code", referred_by)
        .single();

      if (referrer && !referrerError) {
        await notifyReferrer(referrer.email, referrer.referral_code, referrer.referral_count, email);
      } else {
        console.log(`Referrer not found for code: ${referred_by}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notifications sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in waitlist-notification function:", error);
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
