console.log("==> Running bundled version", __filename);
import UmamiReport from "./lib/umamiReport.js";

UmamiReport.githubActionReport()
    .then(() => {
    });
