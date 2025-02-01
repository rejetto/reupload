exports.version = 1.3
exports.description = "(Chrome only) Re-upload a downloaded file if changes are detected. You need upload permission and disable \"don't overwrite uploading\" option. As an alternative to disabling the option, you can give delete permission. If the page is closed or reloaded, the file will stop being monitored."
exports.apiRequired = 8.71 // can_overwrite
exports.repo = "rejetto/reupload"
exports.frontend_js = "main.js"

exports.config = {
    destination: {
        label: "Upload destination",
        placeholder: "$FOLDER/$FILE",
        frontend: true,
        helperText: "Leave empty to overwrite downloaded file.\nAvailable symbols: $FOLDER, $FILE, $USERNAME",
    }
}
exports.configDialog = {
    maxWidth: 'sm',
}
