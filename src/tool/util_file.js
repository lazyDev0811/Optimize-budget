
  // reset/clear FILE type inputs
  export function clearFileInput(ctrl)
  {
    try
    {
      ctrl.value = null;
    }
    catch(ex)
    { }
    if (ctrl.value) ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
  }

  // RFC5987
  export function encodeFilename(str)
  {
    return encodeURIComponent(str).
      // Note that although RFC3986 reserves "!", RFC5987 does not,
      // so we do not need to escape it
      replace(/['()]/g, escape). // i.e., %27 %28 %29
      replace(/\*/g, '%2A').
      // The following are not required for percent-encoding per RFC5987,
      // so we can allow for a little better readability over the wire: |`^
      replace(/%(?:7C|60|5E)/g, unescape);
  }

