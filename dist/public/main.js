"use strict";{
    if (!window.showSaveFilePicker)
        console.warn("Reupload plugin works only on Chrome with https")
    const config = HFS.getPluginConfig()

    HFS.onEvent('fileMenu', ({ entry }) => window.showSaveFilePicker && HFS.state.props?.can_overwrite && {
        label: "Download and re-upload on change",
        icon: 'download',
        async onClick(){
            const folder = location.pathname.slice(0,-1)
            const response = await fetch(entry.uri)
            const blob = await response.blob()
            const handle = await window.showSaveFilePicker({ suggestedName: entry.name, startIn: 'desktop' })
            const writable = await handle.createWritable()
            await writable.write(blob)
            await writable.close()
            HFS.dialogLib.alertDialog("This file is monitored until you close or reload this page.\nYou can use any editor on it, and it will be re-uploaded on change.")
            let last
            let lastTs
            setInterval(async () => {
                try {
                    const file = await handle.getFile()
                    const ts = file.lastModified
                    if (!lastTs)
                        return lastTs = ts
                    if (ts === lastTs) return
                    lastTs = ts
                    last?.abort()
                    console.log('reupload: started')
                    const path = (config.destination || '$FOLDER/$FILE')
                        .replace('$FOLDER', folder)
                        .replace('$FILE', entry.name)
                        .replace('$USERNAME', HFS.state.username || '')
                    last = fetchEx(path + '?existing=overwrite', { method: 'PUT', body: file })
                    await last
                    console.log('reupload: finished')
                    HFS.reloadList()
                }
                catch {}
            }, 2000)
        }
    })
}

function fetchEx(url, init) {
    const controller = new AbortController()
    return Object.assign(fetch(url, {
        ...init,
        signal: controller.signal,
    }), {
        aborted: '',
        abort(reason='cancel') {
            controller.abort(this.aborted = reason)
        }
    })
}
