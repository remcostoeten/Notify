import { toneTokens } from './tokens'
import { kebab } from './utils'
import type { ToastTone } from './types'

function toneVariables(tone: ToastTone): string {
    return Object.entries(toneTokens[tone])
        .map(([name, value]) => `--ntf-${kebab(name)}:var(--ntf-${tone}-${kebab(name)},${value});`)
        .join('')
}

const FONT =
    'Inter,"Inter Variable",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'

const TRANSITION = 'cubic-bezier(.23,1,.32,1)'

const rules = [
    `.ntf-toast{${toneVariables('light')}position:relative;display:flex;align-items:flex-start;gap:15.5px;box-sizing:border-box;width:var(--ntf-width,400px);max-width:100%;padding:16px 16px 15.5px;border-radius:var(--ntf-radius,12px);background:var(--ntf-background);color:var(--ntf-foreground);box-shadow:0 0 0 1px var(--ntf-border),var(--ntf-shadow);font-family:var(--ntf-font,${FONT});font-size:14px;line-height:20px;font-weight:400;font-optical-sizing:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;text-align:left;-webkit-text-size-adjust:100%}`,
    `.ntf-toast[data-tone=dark]{${toneVariables('dark')}}`,
    '.ntf-toast *,.ntf-toast *::before,.ntf-toast *::after{box-sizing:border-box}',
    '.ntf-toast[data-compact]{align-items:center}',
    '.ntf-toast[data-compact] .ntf-close{top:calc(50% - 12px)}',

    '.ntf-item:focus{outline:none}',
    '.ntf-item:focus-visible>*{outline:2px solid var(--ntf-accent,#5f5afa);outline-offset:2px}',

    '.ntf-body{display:flex;flex:1;flex-direction:column;align-items:stretch;min-width:0}',
    '.ntf-title-row{display:flex;align-items:center;gap:8px;min-width:0;padding-right:28px}',
    '.ntf-title{min-width:0;margin:0;color:var(--ntf-foreground);font-weight:600;letter-spacing:-.015em;overflow-wrap:anywhere}',
    '.ntf-divider{flex:none;width:1px;height:16px;background:var(--ntf-divider)}',
    '.ntf-meta{color:var(--ntf-meta);font-weight:400;letter-spacing:-.015em;white-space:nowrap}',
    '.ntf-description{max-width:min(100%,calc(var(--ntf-width,400px)*.71));margin:4px 0 0;color:var(--ntf-body);letter-spacing:-.023em;overflow-wrap:anywhere}',

    '.ntf-icon{position:relative;display:flex;flex:none;align-items:center;justify-content:center;width:20px;height:20px;color:var(--ntf-foreground)}',
    '.ntf-icon svg{position:relative;flex:none;width:20px;height:20px}',
    '.ntf-icon[data-status]{color:var(--ntf-hue)}',
    '.ntf-icon[data-status=success]{--ntf-hue:var(--ntf-success)}',
    '.ntf-icon[data-status=error]{--ntf-hue:var(--ntf-error)}',
    '.ntf-icon[data-status=warning]{--ntf-hue:var(--ntf-warning)}',
    '.ntf-icon[data-status=info]{--ntf-hue:var(--ntf-info)}',
    '.ntf-icon[data-status=loading]{--ntf-hue:var(--ntf-muted)}',
    '.ntf-icon[data-shape=box]{width:40px;height:40px;border:1px solid var(--ntf-control-border);border-radius:8px;background:var(--ntf-control);box-shadow:0 1px 2px rgba(10,13,18,.05)}',
    '.ntf-icon[data-shape=circle] svg{width:24px;height:24px}',
    '.ntf-icon[data-shape=circle]{width:40px;height:40px;border-radius:50%;background:color-mix(in srgb,var(--ntf-hue,var(--ntf-foreground)) 12%,transparent)}',
    '.ntf-icon[data-shape=ring]::before,.ntf-icon[data-shape=ring]::after{content:"";position:absolute;border-radius:50%;border-style:solid;border-color:color-mix(in srgb,var(--ntf-hue,var(--ntf-foreground)) 27%,transparent)}',
    '.ntf-icon[data-shape=ring]::before{inset:-4px;border-width:2px}',
    '.ntf-icon[data-shape=ring]::after{inset:-9px;border-width:2px;border-color:color-mix(in srgb,var(--ntf-hue,var(--ntf-foreground)) 12%,transparent);filter:blur(.6px)}',

    '.ntf-avatar{position:relative;display:block;flex:none;width:40px;height:40px;border-radius:8px;background:var(--ntf-control)}',
    '.ntf-avatar[data-shape=circle]{border-radius:50%}',
    '.ntf-avatar img{display:block;width:100%;height:100%;border-radius:inherit;object-fit:cover}',
    '.ntf-avatar-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:inherit;background:var(--ntf-track);color:var(--ntf-body);font-weight:600}',
    '.ntf-badge{position:absolute;right:-2px;bottom:-2px;width:10px;height:10px;border-radius:50%;background:var(--ntf-icon);box-shadow:0 0 0 2px var(--ntf-background)}',
    '.ntf-badge[data-badge=online]{background:var(--ntf-success)}',
    '.ntf-badge[data-badge=away]{background:var(--ntf-warning)}',
    '.ntf-badge[data-badge=busy]{background:var(--ntf-error)}',

    '.ntf-progress{display:flex;flex-direction:column;margin-top:11px}',
    '.ntf-track{position:relative;height:8px;border-radius:9999px;background:var(--ntf-track);overflow:hidden}',
    `.ntf-fill{height:100%;width:var(--ntf-progress,0%);border-radius:inherit;background:var(--ntf-accent);transition:width .3s ${TRANSITION}}`,
    '.ntf-track[data-indeterminate] .ntf-fill{width:40%;animation:ntf-slide 1.2s ease-in-out infinite}',
    '.ntf-label{align-self:flex-end;margin-top:8.5px;color:var(--ntf-muted);font-variant-numeric:tabular-nums}',
    '.ntf-progress:has(.ntf-label)+.ntf-actions{margin-top:-8.5px}',

    '.ntf-actions{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-top:11px}',
    '.ntf-actions-list{display:flex;flex-wrap:wrap;align-items:center;gap:12px}',
    '.ntf-actions-list:has(.ntf-action[data-variant=text]){gap:8px}',
    '.ntf-aside{flex:none;color:var(--ntf-muted);font-variant-numeric:tabular-nums}',
    `.ntf-action{display:inline-flex;align-items:center;justify-content:center;height:20px;margin:0;padding:0;border:0;border-radius:8px;background:none;color:var(--ntf-action-color,var(--ntf-foreground));font:inherit;font-weight:600;letter-spacing:-.015em;text-decoration:none;white-space:nowrap;cursor:pointer;transition:color .15s,background-color .15s,border-color .15s,opacity .15s,transform .1s ${TRANSITION};-webkit-tap-highlight-color:transparent}`,
    '.ntf-action[data-color=muted]{--ntf-action-color:var(--ntf-muted)}',
    '.ntf-action[data-color=accent]{--ntf-action-color:var(--ntf-accent-text)}',
    '.ntf-action[data-variant=text]:hover{opacity:.75}',
    '.ntf-action[data-variant=text][data-color=muted]:hover{color:var(--ntf-foreground);opacity:1}',
    '.ntf-action[data-variant=outline],.ntf-action[data-variant=filled]{height:34px;padding:0 11px;border:1px solid transparent;--ntf-action-color:var(--ntf-control-foreground)}',
    '.ntf-action[data-variant=outline][data-color=muted],.ntf-action[data-variant=filled][data-color=muted]{--ntf-action-color:var(--ntf-muted)}',
    '.ntf-action[data-variant=outline][data-color=accent],.ntf-action[data-variant=filled][data-color=accent]{--ntf-action-color:var(--ntf-accent-text)}',
    '.ntf-action[data-variant=outline]{border-color:var(--ntf-control-border);background:var(--ntf-background);box-shadow:var(--ntf-control-shadow)}',
    '.ntf-action[data-variant=outline]:hover{background:var(--ntf-control-hover)}',
    '.ntf-action[data-variant=filled]{border-color:var(--ntf-control-border);background:var(--ntf-control);box-shadow:var(--ntf-control-shadow)}',
    '.ntf-action[data-variant=filled]:hover{background:var(--ntf-control-hover)}',
    '.ntf-action[data-variant=filled][data-color=accent]{border-color:color-mix(in srgb,var(--ntf-accent) 80%,#000);background:var(--ntf-accent);color:var(--ntf-accent-foreground);box-shadow:var(--ntf-control-shadow)}',
    '.ntf-action[data-variant=filled][data-color=accent]:hover{background:color-mix(in srgb,var(--ntf-accent) 92%,#000)}',
    '.ntf-action:active{transform:scale(.97)}',
    '.ntf-action:disabled,.ntf-action[aria-disabled=true]{opacity:.5;pointer-events:none}',

    `.ntf-close{position:absolute;top:11.4px;right:11.8px;display:flex;align-items:center;justify-content:center;width:24px;height:24px;margin:0;padding:0;border:0;border-radius:6px;background:none;color:var(--ntf-icon);cursor:pointer;transition:color .15s,background-color .15s,transform .1s ${TRANSITION};-webkit-tap-highlight-color:transparent}`,
    '.ntf-close::after{content:"";position:absolute;inset:-6px}',
    '.ntf-close svg{width:20px;height:20px}',
    '.ntf-close:hover{background:var(--ntf-control-hover);color:var(--ntf-foreground)}',
    '.ntf-close:active{transform:scale(.92)}',

    '.ntf-action:focus-visible,.ntf-close:focus-visible{outline:2px solid var(--ntf-accent);outline-offset:2px}',

    '.ntf-spin{animation:ntf-spin .8s linear infinite}',
    '@keyframes ntf-spin{to{transform:rotate(360deg)}}',
    '@keyframes ntf-slide{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}',
    '@media (prefers-reduced-motion:reduce){.ntf-spin{animation-duration:2s}.ntf-fill{transition:none}.ntf-track[data-indeterminate] .ntf-fill{animation:none;width:100%;opacity:.5}.ntf-action,.ntf-close{transition:none}}'
]

export const toastStyles = rules.join('')
