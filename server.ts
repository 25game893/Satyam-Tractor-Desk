import express from "express";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
const PORT = 3000;

const DB_FILE = path.join(process.cwd(), "db.json");

interface DbSchema {
  tractors: any[];
  tractorModels: any[];
  customers: any[];
  invoices: any[];
  quotations: any[];
  deliveryChallans: any[];
  returnRequests: any[];
  users: any[];
  showroomSettings: any | null;
  activityLogs: any[];
}

function loadDb(): DbSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading DB file, using fallback:", err);
  }

  // Seeding default database
  const defaultDb: DbSchema = {
    tractors: [],
    tractorModels: [],
    customers: [],
    invoices: [],
    quotations: [],
    deliveryChallans: [],
    returnRequests: [],
    users: [
      {
        id: "1",
        username: "admin",
        role: "ADMIN",
        fullName: "System Administrator",
        password: "admin123",
        mobileNumber: "9098832111",
        permissions: [
          "dashboard",
          "inventory",
          "customer-ledger",
          "billing",
          "customers",
          "models",
          "reports",
          "logs",
          "users",
          "settings",
        ],
      },
    ],
    showroomSettings: {
      id: "showroom",
      name: "Satyam Eicher Tractors",
      address: "Main Highway, Industrial Area, Punjab, India",
      phone: "+91 9876543210",
      email: "sales@satyameicher.com",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Eicher_logo.svg/1200px-Eicher_logo.svg.png",
      invoicePrefix: "SE",
      invoiceStartNumber: 1,
      challanStartNumber: 1,
      quotationStartNumber: 1,
      footerMessage: "Thank you for choosing Satyam Eicher. Powering your progress!",
      bankDetails: "HDFC BANK, IFSC: HDFC0001234",
      accountNumber: "50200012345678",
      isShopClosed: false,
    },
    activityLogs: [],
  };

  saveDb(defaultDb);
  return defaultDb;
}

function saveDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing DB file:", err);
  }
}

// 1. Tractors
app.get("/api/tractors", (req, res) => {
  try {
    const dbData = loadDb();
    res.json(dbData.tractors);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/tractors", (req, res) => {
  try {
    const dbData = loadDb();
    const item = req.body;
    const index = dbData.tractors.findIndex((t) => t.id === item.id);
    if (index > -1) {
      dbData.tractors[index] = item;
    } else {
      dbData.tractors.push(item);
    }
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/tractors/:id", (req, res) => {
  try {
    const dbData = loadDb();
    dbData.tractors = dbData.tractors.filter((t) => t.id !== req.params.id);
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 2. Tractor Models
app.get("/api/models", (req, res) => {
  try {
    const dbData = loadDb();
    res.json(dbData.tractorModels);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/models", (req, res) => {
  try {
    const dbData = loadDb();
    const item = req.body;
    const index = dbData.tractorModels.findIndex((m) => m.id === item.id);
    if (index > -1) {
      dbData.tractorModels[index] = item;
    } else {
      dbData.tractorModels.push(item);
    }
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/models/:id", (req, res) => {
  try {
    const dbData = loadDb();
    dbData.tractorModels = dbData.tractorModels.filter((m) => m.id !== req.params.id);
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 3. Customers
app.get("/api/customers", (req, res) => {
  try {
    const dbData = loadDb();
    res.json(dbData.customers);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/customers", (req, res) => {
  try {
    const dbData = loadDb();
    const item = req.body;
    const index = dbData.customers.findIndex((c) => c.id === item.id);
    if (index > -1) {
      dbData.customers[index] = item;
    } else {
      dbData.customers.push(item);
    }
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/customers/:id", (req, res) => {
  try {
    const dbData = loadDb();
    dbData.customers = dbData.customers.filter((c) => c.id !== req.params.id);
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 4. Invoices
app.get("/api/invoices", (req, res) => {
  try {
    const dbData = loadDb();
    res.json(dbData.invoices);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/invoices", (req, res) => {
  try {
    const dbData = loadDb();
    const item = req.body;
    const index = dbData.invoices.findIndex((i) => i.id === item.id);
    if (index > -1) {
      dbData.invoices[index] = item;
    } else {
      dbData.invoices.push(item);
    }
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/invoices/:id", (req, res) => {
  try {
    const dbData = loadDb();
    dbData.invoices = dbData.invoices.filter((i) => i.id !== req.params.id);
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 5. Quotations
app.get("/api/quotations", (req, res) => {
  try {
    const dbData = loadDb();
    res.json(dbData.quotations);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/quotations", (req, res) => {
  try {
    const dbData = loadDb();
    const item = req.body;
    const index = dbData.quotations.findIndex((q) => q.id === item.id);
    if (index > -1) {
      dbData.quotations[index] = item;
    } else {
      dbData.quotations.push(item);
    }
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/quotations/:id", (req, res) => {
  try {
    const dbData = loadDb();
    dbData.quotations = dbData.quotations.filter((q) => q.id !== req.params.id);
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 6. Delivery Challans
app.get("/api/challans", (req, res) => {
  try {
    const dbData = loadDb();
    res.json(dbData.deliveryChallans);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/challans", (req, res) => {
  try {
    const dbData = loadDb();
    const item = req.body;
    const index = dbData.deliveryChallans.findIndex((c) => c.id === item.id);
    if (index > -1) {
      dbData.deliveryChallans[index] = item;
    } else {
      dbData.deliveryChallans.push(item);
    }
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/challans/:id", (req, res) => {
  try {
    const dbData = loadDb();
    dbData.deliveryChallans = dbData.deliveryChallans.filter((c) => c.id !== req.params.id);
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 7. Return Requests
app.get("/api/returns", (req, res) => {
  try {
    const dbData = loadDb();
    res.json(dbData.returnRequests);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/returns", (req, res) => {
  try {
    const dbData = loadDb();
    const item = req.body;
    const index = dbData.returnRequests.findIndex((r) => r.id === item.id);
    if (index > -1) {
      dbData.returnRequests[index] = item;
    } else {
      dbData.returnRequests.push(item);
    }
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/returns/:id", (req, res) => {
  try {
    const dbData = loadDb();
    dbData.returnRequests = dbData.returnRequests.filter((r) => r.id !== req.params.id);
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 8. Users
app.get("/api/users", (req, res) => {
  try {
    const dbData = loadDb();
    res.json(dbData.users);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/users", (req, res) => {
  try {
    const dbData = loadDb();
    const item = req.body;
    const index = dbData.users.findIndex((u) => u.id === item.id);
    if (index > -1) {
      dbData.users[index] = item;
    } else {
      dbData.users.push(item);
    }
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete("/api/users/:id", (req, res) => {
  try {
    const dbData = loadDb();
    dbData.users = dbData.users.filter((u) => u.id !== req.params.id);
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 9. Showroom Settings
app.get("/api/settings", (req, res) => {
  try {
    const dbData = loadDb();
    res.json(dbData.showroomSettings);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/settings", (req, res) => {
  try {
    const dbData = loadDb();
    const settingsObj = req.body;
    settingsObj.id = "showroom";
    dbData.showroomSettings = settingsObj;
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 10. Activity Logs
app.get("/api/logs", (req, res) => {
  try {
    const dbData = loadDb();
    const sortedLogs = [...dbData.activityLogs].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    res.json(sortedLogs);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/logs", (req, res) => {
  try {
    const dbData = loadDb();
    const log = req.body;
    log.id = log.id || Math.random().toString(36).substr(2, 9);
    log.timestamp = log.timestamp || new Date().toISOString();
    dbData.activityLogs.unshift(log);
    if (dbData.activityLogs.length > 500) {
      dbData.activityLogs = dbData.activityLogs.slice(0, 500);
    }
    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 11. Migration / Setup Endpoint
app.post("/api/migrate", (req, res) => {
  try {
    const {
      tractors,
      models,
      customers,
      invoices,
      quotations,
      challans,
      returns,
      users,
      settings,
      logs,
    } = req.body;

    const dbData = loadDb();

    if (settings) {
      dbData.showroomSettings = { id: "showroom", ...settings };
    }
    if (users && users.length > 0) {
      users.forEach((u: any) => {
        if (!dbData.users.some((existing) => existing.id === u.id)) {
          dbData.users.push(u);
        }
      });
    }
    if (models && models.length > 0) {
      models.forEach((m: any) => {
        if (!dbData.tractorModels.some((existing) => existing.id === m.id)) {
          dbData.tractorModels.push(m);
        }
      });
    }
    if (tractors && tractors.length > 0) {
      tractors.forEach((t: any) => {
        if (!dbData.tractors.some((existing) => existing.id === t.id)) {
          dbData.tractors.push(t);
        }
      });
    }
    if (customers && customers.length > 0) {
      customers.forEach((c: any) => {
        if (!dbData.customers.some((existing) => existing.id === c.id)) {
          dbData.customers.push(c);
        }
      });
    }
    if (invoices && invoices.length > 0) {
      invoices.forEach((i: any) => {
        if (!dbData.invoices.some((existing) => existing.id === i.id)) {
          dbData.invoices.push(i);
        }
      });
    }
    if (quotations && quotations.length > 0) {
      quotations.forEach((q: any) => {
        if (!dbData.quotations.some((existing) => existing.id === q.id)) {
          dbData.quotations.push(q);
        }
      });
    }
    if (challans && challans.length > 0) {
      challans.forEach((ch: any) => {
        if (!dbData.deliveryChallans.some((existing) => existing.id === ch.id)) {
          dbData.deliveryChallans.push(ch);
        }
      });
    }
    if (returns && returns.length > 0) {
      returns.forEach((r: any) => {
        if (!dbData.returnRequests.some((existing) => existing.id === r.id)) {
          dbData.returnRequests.push(r);
        }
      });
    }
    if (logs && logs.length > 0) {
      logs.forEach((l: any) => {
        if (!dbData.activityLogs.some((existing) => existing.id === l.id)) {
          dbData.activityLogs.push(l);
        }
      });
    }

    saveDb(dbData);
    res.json({ success: true });
  } catch (err) {
    console.error("POST /api/migrate error:", err);
    res.status(500).json({ error: String(err) });
  }
});

// --- Real SMS & OTP Verification System ---
const activeOtps: Record<string, { code: string; expiresAt: number }> = {};

async function sendRealSMS(mobileNumber: string, otpCode: string): Promise<{ success: boolean; gateway: string; error?: string }> {
  const cleanNumber = mobileNumber.replace(/\D/g, "");
  
  // 1. Try Fast2SMS first if configured
  if (process.env.FAST2SMS_API_KEY) {
    try {
      console.log(`Attempting real SMS send via Fast2SMS to: +91 ${cleanNumber}`);
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "route": "otp",
          "variables_values": otpCode,
          "numbers": cleanNumber
        })
      });
      
      const data = await response.json() as any;
      if (data && data.return === true) {
        console.log(`Fast2SMS success! Message sent to +91 ${cleanNumber}`);
        return { success: true, gateway: "FAST2SMS" };
      } else {
        const errMsg = data?.message || JSON.stringify(data);
        console.error("Fast2SMS dispatch failure details:", errMsg);
        return { success: false, gateway: "FAST2SMS", error: errMsg };
      }
    } catch (err: any) {
      console.error("Fast2SMS Exception:", err);
      return { success: false, gateway: "FAST2SMS", error: err.message };
    }
  }
  
  // 2. Try Twilio if configured
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;
      
      const formattedTo = cleanNumber.length === 10 ? `+91${cleanNumber}` : `+${cleanNumber}`;
      console.log(`Attempting real SMS send via Twilio to: ${formattedTo}`);
      
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const params = new URLSearchParams();
      params.append("To", formattedTo);
      params.append("From", fromNumber);
      params.append("Body", `Your Satyam Tractors login verification code is ${otpCode}. Valid for 5 mins.`);
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });
      
      const data = await response.json() as any;
      if (response.ok) {
        console.log(`Twilio success! Message sent to ${formattedTo}`);
        return { success: true, gateway: "TWILIO" };
      } else {
        const errMsg = data?.message || JSON.stringify(data);
        console.error("Twilio dispatch failure details:", errMsg);
        return { success: false, gateway: "TWILIO", error: errMsg };
      }
    } catch (err: any) {
      console.error("Twilio Exception:", err);
      return { success: false, gateway: "TWILIO", error: err.message };
    }
  }
  
  console.log("No SMS Gateway credentials found in environment. Falling back to sandbox simulator.");
  return { success: false, gateway: "NONE", error: "No API keys configured (FAST2SMS_API_KEY or TWILIO credentials)." };
}

app.post("/api/send-otp", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ error: "Mobile number is required." });
    }
    
    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    activeOtps[mobileNumber] = {
      code: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes validity
    };
    
    const result = await sendRealSMS(mobileNumber, otpCode);
    
    if (result.success) {
      res.json({
        success: true,
        gateway: result.gateway,
        message: `OTP successfully dispatched to +91 ${mobileNumber} via ${result.gateway}.`
      });
    } else {
      // Return simulated code but include warning/instruction
      res.json({
        success: true,
        gateway: "MOCK",
        code: otpCode,
        error: result.error || "SMS Gateway not configured."
      });
    }
  } catch (err) {
    console.error("POST /api/send-otp error:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.post("/api/verify-otp", (req, res) => {
  try {
    const { mobileNumber, code } = req.body;
    if (!mobileNumber || !code) {
      return res.status(400).json({ error: "Mobile number and code are required." });
    }
    
    const record = activeOtps[mobileNumber];
    if (!record) {
      return res.json({ success: false, error: "No OTP request found for this mobile number." });
    }
    
    if (Date.now() > record.expiresAt) {
      delete activeOtps[mobileNumber];
      return res.json({ success: false, error: "Verification code has expired. Please try again." });
    }
    
    if (record.code === code) {
      delete activeOtps[mobileNumber];
      res.json({ success: true });
    } else {
      res.json({ success: false, error: "Incorrect verification code. Please check and try again." });
    }
  } catch (err) {
    console.error("POST /api/verify-otp error:", err);
    res.status(500).json({ error: String(err) });
  }
});


// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        next();
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
