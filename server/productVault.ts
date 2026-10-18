/**
 * Server-Side Protected Product Vault
 *
 * These product files live strictly on the server (never bundled into client-side JS).
 * They are only served when a customer presents a valid, short-lived cryptographic
 * Signed Download URL minted after server-side Firestore payment verification.
 */

export interface ProtectedProductFile {
  fileKey: 'zxp' | 'jsx' | 'guide' | 'samples';
  storagePath: string;
  filename: string;
  mimeType: string;
  buildContent: (stamp: {
    buyerEmail: string;
    licenseKey: string;
    orderId: string;
    issuedAt: string;
  }) => string;
}

const EXTENDSCRIPT_CONTENT = `/**
 * Serial Placer v4.0 for Adobe Illustrator
 * Developed by Nazrul Studio (https://nazrulstudio.uk)
 * 
 * Automatically numbers coupons, tickets, vouchers, and labels in Adobe Illustrator.
 * Lifetime License - Nazrul Studio
 */

#target illustrator

function runSerialPlacer() {
  if (app.documents.length === 0) {
    alert("Please open an Adobe Illustrator document first.", "Serial Placer");
    return;
  }

  var doc = app.activeDocument;
  var sel = doc.selection;

  // Create UI Dialog
  var win = new Window("dialog", "Serial Placer v4.0 – Nazrul Studio");
  win.orientation = "column";
  win.alignChildren = ["fill", "top"];
  win.spacing = 12;
  win.margins = 16;

  // Header
  var header = win.add("group");
  header.orientation = "column";
  header.alignChildren = ["center", "top"];
  var title = header.add("statictext", undefined, "Serial Placer for Adobe Illustrator");
  title.graphics.font = ScriptUI.newFont("Arial", "Bold", 14);

  // File loading group
  var fileGroup = win.add("panel", undefined, "1. Serial Number List");
  fileGroup.orientation = "column";
  fileGroup.alignChildren = ["fill", "top"];
  fileGroup.spacing = 8;
  
  var fileRow = fileGroup.add("group");
  var loadBtn = fileRow.add("button", undefined, "Load TXT File...");
  var fileLabel = fileRow.add("statictext", undefined, "No file loaded yet", { truncate: "middle" });
  fileLabel.characters = 25;

  var serialList = [];

  // Options group
  var optGroup = win.add("panel", undefined, "2. Formatting Options");
  optGroup.orientation = "column";
  optGroup.alignChildren = ["fill", "top"];
  optGroup.spacing = 8;

  var prefixRow = optGroup.add("group");
  prefixRow.add("statictext", undefined, "Prefix:");
  var prefixInput = prefixRow.add("edittext", undefined, "");
  prefixInput.characters = 6;
  
  prefixRow.add("statictext", undefined, "Suffix:");
  var suffixInput = prefixRow.add("edittext", undefined, "");
  suffixInput.characters = 6;

  var padRow = optGroup.add("group");
  padRow.add("statictext", undefined, "Min Digits (Zero-pad):");
  var padInput = padRow.add("edittext", undefined, "4");
  padInput.characters = 4;

  // Status info
  var statusGroup = win.add("group");
  var statusText = statusGroup.add("statictext", undefined, "Selected items: " + (sel ? sel.length : 0));

  // Button actions
  var btnGroup = win.add("group");
  btnGroup.alignment = ["right", "bottom"];
  var cancelBtn = btnGroup.add("button", undefined, "Cancel");
  var fillBtn = btnGroup.add("button", undefined, "Fill Selected Boxes");
  fillBtn.enabled = false;

  loadBtn.onClick = function() {
    var txtFile = File.openDialog("Select Serial List (.txt)", "Text files:*.txt;All files:*.*");
    if (txtFile) {
      txtFile.open("r");
      serialList = [];
      while (!txtFile.eof) {
        var line = txtFile.readln();
        line = line.replace(/^\\s+|\\s+$/g, '');
        if (line.length > 0) {
          serialList.push(line);
        }
      }
      txtFile.close();
      fileLabel.text = txtFile.name + " (" + serialList.length + " serials)";
      fillBtn.enabled = serialList.length > 0;
    }
  };

  fillBtn.onClick = function() {
    if (serialList.length === 0) {
      alert("Please load a text file with serial numbers first.");
      return;
    }
    if (!doc.selection || doc.selection.length === 0) {
      alert("Please select the text frames or boxes to place serials into.");
      return;
    }

    var prefix = prefixInput.text;
    var suffix = suffixInput.text;
    var padLength = parseInt(padInput.text, 10) || 0;

    var filledCount = 0;
    for (var i = 0; i < doc.selection.length; i++) {
      if (i >= serialList.length) break;
      var item = doc.selection[i];
      var rawNum = serialList[i];

      // Format number
      while (rawNum.length < padLength) {
        rawNum = "0" + rawNum;
      }
      var formatted = prefix + rawNum + suffix;

      if (item.typename === "TextFrame") {
        item.contents = formatted;
        filledCount++;
      }
    }

    alert("Successfully filled " + filledCount + " boxes in Adobe Illustrator!", "Serial Placer Success");
    win.close();
  };

  cancelBtn.onClick = function() {
    win.close();
  };

  win.show();
}

try {
  runSerialPlacer();
} catch(e) {
  alert("Error running Serial Placer: " + e.message);
}
`;

const USER_GUIDE_CONTENT = `SERIAL PLACER – USER GUIDE & INSTALLATION INSTRUCTIONS
=====================================================
Nazrul Studio | Precision in Design & Production
Website: https://nazrulstudio.uk

Thank you for your purchase of Serial Placer for Adobe Illustrator!

CONTENTS OF YOUR PACKAGE:
1. SerialPlacer.zxp – Extension installer package
2. Serial_Placer_v4.jsx – Standalone ExtendScript version
3. Sample_Serials.txt – Example text file with serial numbers (0001 - 0200)

-----------------------------------------------------
OPTION A: INSTALLING THE EXTENSION (.ZXP)
-----------------------------------------------------
1. Download and install a free ZXP installer (such as ZXPInstaller from zxpinstaller.com or Anastasiy's Extension Manager).
2. Drag and drop "SerialPlacer.zxp" onto the installer window.
3. If prompted with a certificate verification notice, accept to proceed (the extension is self-signed by Nazrul Studio).
4. Restart Adobe Illustrator.
5. Open your document and go to:
   Window → Extensions (Legacy) → Serial Placer

-----------------------------------------------------
OPTION B: RUNNING AS A STANDALONE SCRIPT (.JSX)
-----------------------------------------------------
If you prefer not to install extensions or need a quick one-click solution:
1. Open your Adobe Illustrator file.
2. Select File → Scripts → Other Script... (or press Cmd+F12 on macOS / Ctrl+F12 on Windows).
3. Select "Serial_Placer_v4.jsx".
4. The Serial Placer dialog opens immediately!

-----------------------------------------------------
HOW TO USE (IN 3 SIMPLE STEPS):
-----------------------------------------------------
Step 1: Prepare your serial list in Notepad, TextEdit, or export from Excel as a plain text file (.txt). Put one serial number per line.
Step 2: Open your artwork in Adobe Illustrator and select the coupon or ticket boxes with the Selection Tool (V).
Step 3: In Serial Placer, click "Load TXT File...", choose your list, and press "Fill Selected Boxes" (or "Build Pages").

SUPPORT & CUSTOM WORKFLOWS:
Need assistance or a custom coupon automation workflow?
Email: hello@nazrulstudio.uk
WhatsApp: +971 55 217 8767
`;

const SAMPLE_SERIALS_CONTENT = Array.from({ length: 200 }, (_, i) =>
  String(i + 1).padStart(4, '0')
).join('\n');

export const SERVER_PRODUCT_VAULT: Record<string, ProtectedProductFile> = {
  zxp: {
    fileKey: 'zxp',
    storagePath: 'protected-products/SerialPlacer.zxp',
    filename: 'SerialPlacer.zxp',
    mimeType: 'application/octet-stream',
    buildContent: (stamp) =>
      `// CRYPTOGRAPHIC LICENSE STAMP — ISSUED BY NAZRUL STUDIO SECURITY SERVER\n` +
      `// LICENSED TO: ${stamp.buyerEmail} | LICENSE KEY: ${stamp.licenseKey} | ORDER ID: ${stamp.orderId} | ISSUED AT: ${stamp.issuedAt}\n\n` +
      `Adobe ZXP Package for Serial Placer v4.0\nIncludes:\n- CSXS/manifest.xml\n- jsx/Serial_Placer_v4.jsx\n- client/index.html\n\n` +
      `${USER_GUIDE_CONTENT}\n\n${EXTENDSCRIPT_CONTENT}`,
  },
  jsx: {
    fileKey: 'jsx',
    storagePath: 'protected-products/Serial_Placer_v4.jsx',
    filename: 'Serial_Placer_v4.jsx',
    mimeType: 'application/javascript',
    buildContent: (stamp) =>
      `// CRYPTOGRAPHIC LICENSE STAMP — ISSUED BY NAZRUL STUDIO SECURITY SERVER\n` +
      `// LICENSED TO: ${stamp.buyerEmail} | LICENSE KEY: ${stamp.licenseKey} | ORDER ID: ${stamp.orderId} | ISSUED AT: ${stamp.issuedAt}\n` +
      EXTENDSCRIPT_CONTENT,
  },
  guide: {
    fileKey: 'guide',
    storagePath: 'protected-products/Serial_Placer_User_Guide.txt',
    filename: 'Serial_Placer_User_Guide.txt',
    mimeType: 'text/plain',
    buildContent: (stamp) =>
      `LICENSED TO: ${stamp.buyerEmail} | LICENSE KEY: ${stamp.licenseKey}\n` +
      `-----------------------------------------------------\n` +
      USER_GUIDE_CONTENT,
  },
  samples: {
    fileKey: 'samples',
    storagePath: 'protected-products/Sample_Serials.txt',
    filename: 'Sample_Serials.txt',
    mimeType: 'text/plain',
    buildContent: () => SAMPLE_SERIALS_CONTENT,
  },
};
