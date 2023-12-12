// Adaptado de https://pt.wikipedia.org/wiki/Usu%C3%A1rio:Luizdl/Script_de_ajustes.js
mw.loader.using('mediawiki.storage').then(function () {
  mw.storage.session.set( 'client-error-opt-out', '1' );
});


function mergeDuplicateRefs(text) {

  // Regular expression to match <ref> tags
  var refPattern = /<ref\s+name\s*=\s*"(.*?)">(.*?)<\/ref>/g;

  // Object to store reference names and their counts
  var refCounts = {};

  var inputText = text;
  // Function to replace duplicate references with shortcuts
  function replaceDuplicate(match, name, content) {
    if (!refCounts[name]) {
      // First occurrence, add to the counts object
      refCounts[name] = 1;
      return match; // Keep the first occurrence as is
    } else {
      // Duplicate occurrence, replace with a shortcut
      refCounts[name]++;
      return `<ref name="${name}" />`;
    }
  }

  // Replace duplicates and store the modified text
  var modifiedText = inputText.replace(refPattern, replaceDuplicate);
  console.log(modifiedText);


  return modifiedText;
}

function runAutoFix(targetWindow) {
  if (targetWindow == window) _();
  else $(targetWindow).load(_);

  function _() {
      if (!targetWindow.waitAfterRunning) {
          targetWindow.textBox= null
          targetWindow.sumarioEl = null;
      }
      targetWindow.waitAfterRunning = undefined;

      if (targetWindow.ve && targetWindow.ve.init) {
          var mode = targetWindow.ve.init.target.surface.getMode()
          if (mode == 'source') {
              textBox= {
                  valor: targetWindow.ve.init.target.surface.model.documentModel.data.getSourceText(),
                  get value() {
                      return this.valor == null
                          ? '' : this.valor;
                  },
                  set value(val) {
                      this.valor = val.toString();
                  }
              }
          } else {
              return;
          }
      } else if (targetWindow.wikEd && targetWindow.wikEd.textarea) {
          if (targetWindow.wikEd.useWikEd === true)
              targetWindow.wikEd.UpdateTextarea();
          textBox= targetWindow.wikEd.textarea;
          targetWindow.wikEd.useWikEd = false;
      } else if (targetWindow.$('.CodeMirror').length) {
          try {
              textBox= targetWindow.$('.CodeMirror')[0].CodeMirror;

              textBox.__defineGetter__('value', function () {
                  return this.getValue();
              });
              textBox.__defineSetter__('value', function (val) {
                  this.setValue(val);
              });
          } catch (e) {
              textBox= targetWindow.document.getElementById('wpTextbox1');
          }

      } else {
          textBox= targetWindow.document.getElementById('wpTextbox1');
      }
      if (!window.sumarioEl)
          sumarioEl = targetWindow.document.getElementById('wpSummary');
      var temporaryText = textBox.value;
      var sumario = '';

      aviso = false;

      textBox.value = mergeDuplicateRefs(temporaryText) ;

      var sumarioChanged = sumarioEl.value + ' + desduplicando referências usando [[user:TiagoLubiana/Desduplicador.js|script desduplicador]]';
      sumarioEl.value = sumarioChanged;

      if (!(targetWindow.ve && targetWindow.ve.init)) {
        var tmp = targetWindow.document.getElementById('wpMinoredit');
        if (tmp)
              tmp.checked = true;
          if (!aviso) {
              //targetWindow.document.getElementById('wpPreview').click();
              targetWindow.document.getElementById('wpDiff').click();
              //targetWindow.document.getElementById('wpSave').click();
          }
          textBox= null
          sumarioEl = null;
      } else {
          if (aviso) {
              if (!window.avisove) {
                  avisove = true;
                  return;
              }
          }
          avisove = false;

          var form = $('<form style="display:none" method="post" action="/wiki/' + targetWindow.mw.config.get('wgPageName')
              + '"><input name="action" value="' + 'submit'
              + '"><textarea name="wpTextbox1">'
              + '</textarea><input name="wpSummary" value="' + sumarioEl.value
              + '"><input name="wpMinoredit" value="' + 'on'
              + '"><input name="wpDiff" value="' + 'Mostrar alterações'
              + '"><input name="editRevId" value="' + targetWindow.mw.config.get("wgCurRevisionId")
              + '"><input name="parentRevId" value="' + targetWindow.mw.config.get("wgCurRevisionId")
              + '"><input name="baseRevId" value="' + targetWindow.mw.config.get("wgCurRevisionId")
              + '"><input name="wpStarttime" value="' + (new Date()).toISOString().replace(/[^0-9]/g, "").slice(0, -3)
              + ($("#ca-unwatch").length ? '"><input name="wpWatchthis" checked type="checkbox' : '')
              + '"><input name="mode" value="diff'
              + '"><input name="model" value="wikitext'
              + '"><input name="format" value="text/x-wiki'
              + '"><input name="wpUltimateParam" value="1'
              + '"></form>');

          form.find("textarea").val(textBox.value);
          $(document.body).append(form);
          window.onbeforeunload = null;
          form.submit();
      }
  }
}


if (document.getElementById('wpTextbox1') && document.getElementById('wpDiff')) {
  document.getElementById('wpDiff').outerHTML =
      document.getElementById('wpDiff').outerHTML.replace('accesskey="v"', 'accesskey="d"')
          .replace('alt-shift-v', 'alt-shift-d')
      + '\n<input id="Desduplicar referências" '
      + 'name="Desduplicar referências" tabindex="7" title="Desduplicar referências [alt-shift-a]" '
      + 'type="button" class="' + $("#wpDiff").prop("class") + '" value="Desduplicar referências" accesskey="a" onclick="runAutoFix(window)">';
}

