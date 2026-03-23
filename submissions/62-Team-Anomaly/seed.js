const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './client/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    console.log("Seeding tickets...");

    const { data, error } = await supabase
        .from('tickets')
        .insert([
            { title: "Cannot access Advanced Analytics", status: "In Progress", priority: "High", agent: "Alex Carter" },
            { title: "Billing cycle sync failure", status: "Resolved", priority: "Medium", agent: "Sarah Lee" },
            { title: "Login page 500 error", status: "Open", priority: "High", agent: "Unassigned" },
            { title: "Update account email", status: "Resolved", priority: "Low", agent: "Bot (Auto)" },
            { title: "API rate limit exceeded", status: "Open", priority: "Medium", agent: "Alex Carter" },
        ])
        .select();

    if (error) {
        console.error("Error seeding tickets:", error.message);
    } else {
        console.log("Successfully seeded tickets:", data.length);
    }
}

seed();
