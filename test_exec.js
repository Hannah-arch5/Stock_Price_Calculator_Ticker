const { exec } = require('child_process');
exec('python3 get_pdf_path.py V3B6RSCE', (error, stdout, stderr) => {
    console.log("Error:", error);
    console.log("Stdout:", stdout);
});
