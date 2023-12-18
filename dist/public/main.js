"use strict";{
    if (!window.showSaveFilePicker)
        console.warn("Reupload plugin works only on https")

    HFS.onEvent('fileMenu', ({ entry, menu }) => window.showSaveFilePicker && HFS.state.props.can_overwrite && {
        label: "Download and re-upload on change",
        icon: 'download',
        async onClick(){
            const response = await fetch(entry.uri)
            const blob = await response.blob()
            const handle = await window.showSaveFilePicker({ suggestedName: entry.name, startIn: 'desktop' })
            const writable = await handle.createWritable()
            await writable.write(blob)
            await writable.close()
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
                    const body = new FormData()
                    body.append('file', file, entry.name)
                    last?.abort()
                    console.log('reupload: started')
                    last = fetchEx(location + '?overwrite', { method: 'POST', body })
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
