// Adaptado de https://pt.wikipedia.org/wiki/Usu%C3%A1rio:Luizdl/Script_de_ajustes.js

mw.loader.using('mediawiki.storage').then(function () {
  mw.storage.session.set( 'client-error-opt-out', '1' );
});

function mergeDuplicateRefs(text) {
    var refPattern = /<ref\s+name\s*=\s*"(.*?)">\s*{{(.*?)}}\s*<\/ref>/g;
    var foundRefs = {};
    var modifiedText = text;

    modifiedText = modifiedText.replace(refPattern, function(match, refName, refContent) {
        if (foundRefs.hasOwnProperty(refName)) {
            // If already found, replace with shortcut
            return '<ref name="' + refName + '" />';
        } else {
            // If not found, keep the full reference and mark as found
            foundRefs[refName] = true;
            return match;
        }
    });

    return modifiedText;
}


novoEditor = mw.user.options.get('visualeditor-newwikitext') == '1';

var mesesEn = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'summer', 'spring', 'fall', 'autumn', 'winter'];
var mesesPt = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro', 'verão', 'primavera', 'outono', 'outono', 'inverno'];

function tradMes(mes) {
    for (var i = 0; i < mesesEn.length; i++) {
        if (mes.toLocaleLowerCase() == mesesEn[i]
            || mes.toLocaleLowerCase() == mesesEn[i].substring(0, 3))
            return mesesPt[i];
        else if (mes.toLocaleLowerCase() == mesesPt[i])
            return mes;
        else if (mes.toLocaleLowerCase() == 'marco')
            return 'março';
    }
    return 'falhou';
}

//datas
var cvGrauO = "([^\\|\\}]*°[^\\|\\}]*[\\|\\}])",
    diaMesAno = "\\s*(\\d+(?:[–\\-\\/]\\d+|))\\s+([A-Za-zç]+)\\s+(\\d\\d\\d\\d?)\\.?",
    linkDiaMesAno = "\\s*\\[\\[0?(\\d+(?:[–\\-\\/]\\d+|))\\s+de\\s+([A-Za-zç]+)\\]\\]\\s+de\\s+\\[?\\[?(\\d+)\\]?\\]?\\.?",
    mesDiaAno = "\\s*([A-Za-zç]+)\\s+(\\d+(?:[–\\-\\/]\\d+|)),\\s+(\\d\\d\\d\\d?)",
    mesAno = "\\s*([A-Za-zç]+),?\\s+(\\d\\d\\d\\d?)",
    mesMesAno = "\\s*([A-Za-zç]+)\\s*[–\\-\\/]\\s*([A-Za-zç]+),?\\s*d?e?\\s+(\\d\\d\\d\\d?)",
    nAnoMes = "\\s*(\\d\\d\\d\\d?)[\\-\\/](\\d\\d?)(\\s*\\|)",
    nMesAno = "\\s*(\\d\\d?)[\\-\\/](\\d\\d\\d\\d?)(\\s*\\|)",
    sAnoMesDia = "\\s*(\\d\\d\\d\\d?)[\\-\\/]([A-Za-z]+)[\\-\\/](\\d\\d?)(\\s*\\|)",
    sDiaMesAno = "\\s*(\\d\\d?)[\\-\\/]([A-Za-z]+)[\\-\\/](\\d\\d\\d\\d?)(\\s*\\|)",
    _0diaMesAno = "\\s*0(\\d+(?:[–\\-\\/]\\d+|))\\s+de\\s+([A-Za-zç]+)\\s+de\\s+(\\d\\d\\d\\d?)\\.?",
    diaMesVAno = "\\s*\\[?\\[?(\\d\\d?(?:[–\\-\\/]\\d\\d?|))\\s+de\\s+([A-Za-zç]+)\\]?\\]?,?\\s+\\[?\\[?(\\d\\d\\d\\d?)\\]?\\]?\\.?",
    prData = "\\s*\\{\\{\\s*[Dd]ata\\s*\\|\\s*(\\d\\d\\d\\d?)\\s*\\|\\s*(\\d\\d?)\\s*\\|\\s*(\\d\\d?)[^\{\}]*\\}\\}\\.?",
    prDataExt = "\\s*\\{\\{[Dd]ataExt\\s*\\|\\s*(\\d\\d?)\\s*\\|\\s*(\\d\\d?)\\s*\\|\\s*(\\d\\d\\d\\d?)[^\{\}]*\\}\\}\\.?",
    marco = "s*((:?\\d\\d?(?:[–\\-\\/]\\d\\d?|)[\\.º]?[º]?\\s+de\\s+|)[Mm]arco\\s+de\\s+\\d\\d\\d\\d?)\\.?";
//parâmetros
var data = "\\|\\s*(?:dat[ea]|year|ano)\\s*=",
    transmissao = "\\|\\s*(?:transmissão|air\\-?date)\\s*=",
    acessodata = "\\|\\s*(?:acc?esso?\\-?dat[ea]|acc?essadoem)\\s*=",
    publicacao = "\\|\\s*(?:publication\\-?date|data\\-publica[cç][aã]o)\\s*=",
    arquivodata = "\\|\\s*ar[cq][hu]iv[eo]\\-?dat[ea]\\s*=";

function rDatas(alt, padrao) {
    if (alt.match(/falhou/)) return padrao;
    else return alt;
}
function rdata(alt, padrao) {
    return rDatas('|data=' + alt, padrao);
}
function rtransmissao(alt, padrao) {
    return rDatas('|transmissão=' + alt, padrao);
}
function racessodata(alt, padrao) {
    return rDatas('|acessodata=' + alt, padrao);
}
function rpublicacao(alt, padrao) {
    return rDatas('|data-publicação=' + alt, padrao);
}
function rarquivodata(alt, padrao) {
    return rDatas('|arquivodata=' + alt, padrao);
}

function replaceDate(match, pattern, replacement) {
    return match.replace(pattern, replacement);
}

function formatDate(match) {
    return match.replace(/[\-\/]/, '–').replace('°', 'º').replace(/[Mm]arco/, 'março');
}

function processDate(match) {
    let parts = match.split(/\s+de\s+/);
    if (parts.length === 3) {
        parts[1] = tradMes(parts[1]); // Translate month name
        return parts.join(' de ');
    }
    return match;
}

function processData(match) {
    return (mesesPt[parseInt(match) - 1]) ? processDate(match) : match;
}

citacoes = {
    datas: {
        cond: [
            {
                reg: /\|\s*(?:ano|year|data|transmissão|publicação|arquivodata|acessodata)\s*=\s*(.*)/, 
                subs: function (match) {
                    // Process the match based on its content
                    if (/\d{4}\]\]/.test(match)) return '|ano=' + match.match(/\d{4}/)[0];
                    if (/\d{4}/.test(match)) return processData(formatDate(match));
                    return match; // Return original match if no conditions met
                }
            }
        ],
        sumario: 'ajustando datas'
    },

    tradpred: {
        cond: [
            {
                reg: /\{\s*[Cc]ite ?web *(\s*\|)/, subs: function (achou) {
                    return '{citar web' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite AV media notes *(\s*\|)/, subs: function (achou) {
                    return '{citar vídeo notas' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite (?:video|AV media) *(\s*\|)/, subs: function (achou) {
                    return '{citar vídeo' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite video game *(\s*\|)/, subs: function (achou) {
                    return '{Citar jogo eletrônico' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite thesis *(\s*\|)/, subs: function (achou) {
                    return '{citar tese' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite magazine *(\s*\|)/, subs: function (achou) {
                    return '{citar revista' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite report *(\s*\|)/, subs: function (achou) {
                    return '{citar relatório' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite podcast *(\s*\|)/, subs: function (achou) {
                    return '{citar podcast' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite ?news(?:paper|) *(\s*\|)/, subs: function (achou) {
                    return '{citar jornal' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite map *(\s*\|)/, subs: function (achou) {
                    return '{citar mapa' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite book *(\s*\|)/, subs: function (achou) {
                    return '{citar livro' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite mailing list *(\s*\|)/, subs: function (achou) {
                    return '{citar lista de discussão' + achou[1];
                }
            },
            {
                reg: /\{\s*(?:[Cc]ite (?:journal|paper|document)|[Aa]rticle) *(\s*\|)/, subs: function (achou) {
                    return '{citar periódico' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite newsgroup *(\s*\|)/, subs: function (achou) {
                    return '{citar grupo de notícias' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite episode *(\s*\|)/, subs: function (achou) {
                    return '{citar episódio' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite serial *(\s*\|)/, subs: function (achou) {
                    return '{citar série' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite interview *(\s*\|)/, subs: function (achou) {
                    return '{citar entrevista' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite encyclopedia *(\s*\|)/, subs: function (achou) {
                    return '{citar enciclopédia' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite conference *(\s*\|)/, subs: function (achou) {
                    return '{citar conferência' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite press(?: release|) *(\s*\|)/, subs: function (achou) {
                    return '{citar comunicado de imprensa' + achou[1];
                }
            },
            {
                reg: /\{\s*[Cc]ite ar[Xx]iv *(\s*\|)/, subs: function (achou) {
                    return '{citar arXiv' + achou[1];
                }
            },
            {
                reg: /\|\s*at\s*=/, subs: function (achou) {
                    return '|em=';
                }
            },
            {
                reg: /\|\s*accesso?\-?dat[ea]\s*=/, subs: function (achou) {
                    return '|acessodata=';
                }
            },
            {
                reg: /\|\s*date\s*=/, subs: function (achou) {
                    return '|data=';
                }
            },
            {
                reg: /\|\s*publication\-?date\s*=/, subs: function (achou) {
                    return '|data-publicacao=';
                }
            },
            {
                reg: /\|\s*air\-?date\s*=/, subs: function (achou) {
                    return '|transmissão=';
                }
            },
            {
                reg: /\|\s*archive\-?date\s*=/, subs: function (achou) {
                    return '|arquivodata=';
                }
            },
            {
                reg: /\|\s*archive\-?url\s*=/, subs: function (achou) {
                    return '|arquivourl=';
                }
            },
            {
                reg: /\|\s*agency\s*=/, subs: function (achou) {
                    return '|agência=';
                }
            },
            {
                reg: /\|\s*authors\s*=/, subs: function (achou) {
                    return '|autores=';
                }
            },
            {
                reg: /\|\s*people\s*=/, subs: function (achou) {
                    return '|pessoas=';
                }
            },
            {
                reg: /\|\s*credits\s*=/, subs: function (achou) {
                    return '|créditos=';
                }
            },
            {
                reg: /\|\s*book\-?title\s*=/, subs: function (achou) {
                    return '|títulolivro=';
                }
            },
            {
                reg: /\|\s*call\-?sign\s*=/, subs: function (achou) {
                    return '|indicativo=';
                }
            },
            {
                reg: /\|\s*cartography\s*=/, subs: function (achou) {
                    return '|cartografia=';
                }
            },
            {
                reg: /\|\s*chapter\s*=/, subs: function (achou) {
                    return '|capítulo=';
                }
            },
            {
                reg: /\|\s*article\s*=/, subs: function (achou) {
                    return '|artigo=';
                }
            },
            {
                reg: /\|\s*contribution\s*=/, subs: function (achou) {
                    return '|contribuição=';
                }
            },
            {
                reg: /\|\s*chapter\-format\s*=/, subs: function (achou) {
                    return '|formato-capitulo=';
                }
            },
            {
                reg: /\|\s*chapter\-?url\s*=/, subs: function (achou) {
                    return '|capítulourl=';
                }
            },
            {
                reg: /\|\s*coauthors?\s*=/, subs: function (achou) {
                    return '|coautor=';
                }
            },
            {
                reg: /\|\s*collaboration\s*=/, subs: function (achou) {
                    return '|colaboração=';
                }
            },
            {
                reg: /\|\s*conference\s*=/, subs: function (achou) {
                    return '|conferencia=';
                }
            },
            {
                reg: /\|\s*conference-format\s*=/, subs: function (achou) {
                    return '|formato-conferencia=';
                }
            },
            {
                reg: /\|\s*conference\-?url\s*=/, subs: function (achou) {
                    return '|urlconferencia=';
                }
            },
            {
                reg: /\|\s*contribution\s*=/, subs: function (achou) {
                    return '|contribuição=';
                }
            },
            {
                reg: /\|\s*(?:dead\-?url|url\-status)\s*=\s*(?:[Nn](?:[Oo]|)|[Ll][Ii][Vv][Ee])\s*([\|\}])/, subs: function (achou) {
                    return '|urlmorta= não' + achou[1];
                }
            },
            {
                reg: /\|\s*(?:dead\-?url|url\-status)\s*=\s*(?:[Yy](?:[Ee][Ss]|)|[Dd][Ee][Aa][Dd])\s*([\|\}])/, subs: function (achou) {
                    return '|urlmorta= sim' + achou[1];
                }
            },
            {
                reg: /\|\s*(?:dead\-?url|url\-status)\s*=/, subs: function (achou) {
                    return '|urlmorta=';
                }
            },
            {
                reg: /\|\s*degree\s*=/, subs: function (achou) {
                    return '|grau=';
                }
            },
            {
                reg: /\|\s*edition\s*=/, subs: function (achou) {
                    return '|edição=';
                }
            },
            {
                reg: /\|\s*editors\s*=/, subs: function (achou) {
                    return '|editores=';
                }
            },
            {
                reg: /\|\s*encyclopa?edia\s*=/, subs: function (achou) {
                    return '|enciclopédia=';
                }
            },
            {
                reg: /\|\s*episode\s*=/, subs: function (achou) {
                    return '|episódio=';
                }
            },
            {
                reg: /\|\s*format\s*=/, subs: function (achou) {
                    return '|formato=';
                }
            },
            {
                reg: /\|\s*language\s*=/, subs: function (achou) {
                    return '|língua=';
                }
            },
            {
                reg: /\|\s*interviewers?\s*=/, subs: function (achou) {
                    return '|entrevistador=';
                }
            },
            {
                reg: /\|\s*map\s*=/, subs: function (achou) {
                    return '|mapa=';
                }
            },
            {
                reg: /\|\s*map\-format\s*=/, subs: function (achou) {
                    return '|formato-mapa=';
                }
            },
            {
                reg: /\|\s*map\-url\s*=/, subs: function (achou) {
                    return '|urlmapa=';
                }
            },
            {
                reg: /\|\s*minutes\s*=/, subs: function (achou) {
                    return '|minuto=';
                }
            },
            {
                reg: /\|\s*network\s*=/, subs: function (achou) {
                    return '|rede=';
                }
            },
            {
                reg: /\|\s*orig\-?year\s*=/, subs: function (achou) {
                    return '|anooriginal=';
                }
            },
            {
                reg: /\|\s*pages\s*=/, subs: function (achou) {
                    return '|páginas=';
                }
            },
            {
                reg: /\|\s*page\s*=/, subs: function (achou) {
                    return '|página=';
                }
            },
            {
                reg: /\|\s*(?:number|issue)\s*=/, subs: function (achou) {
                    return '|número=';
                }
            },
            {
                reg: /\|\s*journal\s*=/, subs: function (achou) {
                    return '|periódico=';
                }
            },
            {
                reg: /\|\s*newspaper\s*=/, subs: function (achou) {
                    return '|jornal=';
                }
            },
            {
                reg: /\|\s*magazine\s*=/, subs: function (achou) {
                    return '|revista=';
                }
            },
            {
                reg: /\|\s*dictionary\s*=/, subs: function (achou) {
                    return '|dicionário=';
                }
            },
            {
                reg: /\|\s*work\s*=/, subs: function (achou) {
                    return '|obra=';
                }
            },
            {
                reg: /\|\s*place\s*=/, subs: function (achou) {
                    return '|local=';
                }
            },
            {
                reg: /\|\s*location\s*=/, subs: function (achou) {
                    return '|local=';
                }
            },
            {
                reg: /\|\s*publication\-?place\s*=/, subs: function (achou) {
                    return '|local-publicação=';
                }
            },
            {
                reg: /\|\s*publisher\s*=/, subs: function (achou) {
                    return '|publicado=';
                }
            },
            {
                reg: /\|\s*institution\s*=/, subs: function (achou) {
                    return '|instituição=';
                }
            },
            {
                reg: /\|\s*quote?a?t?i?o?n?\s*=/, subs: function (achou) {
                    return '|citação=';
                }
            },
            {
                reg: /\|\s*registration\s*=/, subs: function (achou) {
                    return '|registro=';
                }
            },
            {
                reg: /\|\s*section\s*=/, subs: function (achou) {
                    return '|seção=';
                }
            },
            {
                reg: /\|\s*season\s*=/, subs: function (achou) {
                    return '|temporada=';
                }
            },
            {
                reg: /\|\s*sections\s*=/, subs: function (achou) {
                    return '|seções=';
                }
            },
            {
                reg: /\|\s*sheet\s*=/, subs: function (achou) {
                    return '|folha=';
                }
            },
            {
                reg: /\|\s*sheets\s*=/, subs: function (achou) {
                    return '|folhas=';
                }
            },
            {
                reg: /\|\s*station\s*=/, subs: function (achou) {
                    return '|estação=';
                }
            },
            {
                reg: /\|\s*subscription\s*=/, subs: function (achou) {
                    return '|subscrição=';
                }
            },
            {
                reg: /\|\s*time\s*=/, subs: function (achou) {
                    return '|tempo=';
                }
            },
            {
                reg: /\|\s*time\-?caption\s*=/, subs: function (achou) {
                    return '|lengenda=';
                }
            },
            {
                reg: /\|\s*title\s*=/, subs: function (achou) {
                    return '|título=';
                }
            },
            {
                reg: /\|\s*title\-?link\s*=/, subs: function (achou) {
                    return '|títulolink=';
                }
            },
            {
                reg: /\|\s*episode\-?link\s*=/, subs: function (achou) {
                    return '|episódiolink=';
                }
            },
            {
                reg: /\|\s*department\s*=/, subs: function (achou) {
                    return '|departamento=';
                }
            },
            {
                reg: /\|\s*type\s*=/, subs: function (achou) {
                    return '|tipo=';
                }
            },
            {
                reg: /\|\s*trans\-?chapter\s*=/, subs: function (achou) {
                    return '|capítulo-trad=';
                }
            },
            {
                reg: /\|\s*transcript\-format\s*=/, subs: function (achou) {
                    return '|transcricao-formato=';
                }
            },
            {
                reg: /\|\s*transcript\s*=/, subs: function (achou) {
                    return '|transcrição=';
                }
            },
            {
                reg: /\|\s*transcript\-?url\s*=/, subs: function (achou) {
                    return '|transcriçãourl=';
                }
            },
            {
                reg: /\|\s*trans\-?title\s*=/, subs: function (achou) {
                    return '|títulotrad=';
                }
            },
            {
                reg: /\|\s*year\s*=/, subs: function (achou) {
                    return '|ano=';
                }
            },
            {
                reg: /\|\s*platform\s*=/, subs: function (achou) {
                    return '|plataforma=';
                }
            },
            {
                reg: /\|\s*version\s*=/, subs: function (achou) {
                    return '|versão=';
                }
            },
            {
                reg: /\|\s*scene\s*=/, subs: function (achou) {
                    return '|cena=';
                }
            },
            {
                reg: /\|\s*level\s*=/, subs: function (achou) {
                    return '|fase=';
                }
            },
            {
                reg: /\|\s*author(\d\d?)?\s*=/, subs: function (achou) {
                    return '|autor' + (achou[1] ? achou[1] : '') + '=';
                }
            },
            {
                reg: /\|\s*author(\d\d?)?\-?link\s*=/, subs: function (achou) {
                    return '|autorlink' + (achou[1] ? achou[1] : '') + '=';
                }
            },
            {
                reg: /\|\s*first(\d\d?)?\s*=/, subs: function (achou) {
                    return '|primeiro' + (achou[1] ? achou[1] : '') + '=';
                }
            },
            {
                reg: /\|\s*last(\d\d?)?\s*=/, subs: function (achou) {
                    return '|último' + (achou[1] ? achou[1] : '') + '=';
                }
            },
            {
                reg: /\|\s*editor(\d\d?)?\-last\s*=/, subs: function (achou) {
                    return '|editor-sobrenome' + (achou[1] ? achou[1] : '') + '=';
                }
            },
            {
                reg: /\|\s*editor(\d\d?)?\-first\s*=/, subs: function (achou) {
                    return '|editor-nome' + (achou[1] ? achou[1] : '') + '=';
                }
            },
            {
                reg: /\|\s*developer(\d\d?)?\s*=/, subs: function (achou) {
                    return '|desenvolvedor' + (achou[1] ? achou[1] : '') + '=';
                }
            }
        ],
        sumario: 'traduzindo nome/parâmetro'
    },

    geral: {
        cond: [
            {
                reg: /\|\s*accessadoem\s*=/, subs: function (achou) {
                    return "|acessadoem=";
                }
            },
            {
                reg: /\|\s*t[ií]tulo\s*=\s*([^\|\}]*[\S])(\s*[\|\}])/, subs: function (achou) {
                    if (achou[1].match(/\u200B|\n/)) {
                        var tmp = achou[1].replace(/ *\n */g, ' ');
                        return '|título=' + tmp.replace(/\u200B/g, '') + achou[2];
                    }
                    return achou[0];
                }
            },
            {
                reg: /\|\s*(?:l[ií]ngua[23]|lang)\s*=/, subs: function (achou) {
                    return '|língua=';
                }
            },
            {
                reg: /\|\s*[Ii][Dd]\s*=\s*ISBN/, subs: function (achou) {
                    return '|isbn=';
                }
            },
            {
                reg: /\{\s*[Rr]eferência a livro/, subs: function (achou) {
                    return '{citar livro';
                }
            },
            {
                reg: /\|\s*Ano\s*=/, subs: function (achou) {
                    return '|ano=';
                }
            },
            {
                reg: /\|\s*Autor\s*=/, subs: function (achou) {
                    return '|autor=';
                }
            },
            {
                reg: /\|\s*Autorlink\s*=/, subs: function (achou) {
                    return '|autorlink=';
                }
            },
            {
                reg: /\|\s*Editora\s*=/, subs: function (achou) {
                    return '|editora=';
                }
            },
            {
                reg: /\|\s*T[ií]tulo\s*=/, subs: function (achou) {
                    return '|título=';
                }
            },
            {
                reg: /\|\s*P[aá]gina\s*=/, subs: function (achou) {
                    return '|página=';
                }
            },
            {
                reg: /\|\s*P[aá]ginas\s*=/, subs: function (achou) {
                    return '|páginas=';
                }
            },
            {
                reg: /\|\s*Local de publicação\s*=/, subs: function (achou) {
                    return '|local-publicação=';
                }
            },
            {
                reg: /\|\s*Subt[ií]tulo\s*=/, subs: function (achou) {
                    return '|subtítulo=';
                }
            },
            {
                reg: /\|\s*Colec?[cç][aã]o\s*=/, subs: function (achou) {
                    return '|coleção=';
                }
            },
            {
                reg: /\|\s*N[uú]mero\s*=/, subs: function (achou) {
                    return '|numero=';
                }
            },
            {
                reg: /\|\s*Edição\s*=/, subs: function (achou) {
                    return '|edição=';
                }
            },
            {
                reg: /\|\s*Cap[ií]tulo\s*=/, subs: function (achou) {
                    return '|capítulo=';
                }
            },
            {
                reg: /\|\s*Notas\s*=/, subs: function (achou) {
                    return '|notas=';
                }
            },
            {
                reg: /\|\s*Volume\s*=/, subs: function (achou) {
                    return '|volume=';
                }
            },
            {
                reg: /\|\s*[Vv]olumes\s*=[^\|\[\{\}]*((?:\}\}|\|))/, subs: function (achou) {
                    return achou[1];
                }
            }
        ],
        sumario: 'ajustes gerais'
    },

    duplicado: {
        sumario: 'rm duplicados'
    },

    //predefinições com exclusividade de verificação
    apenas: [/\{\{\s*[Cc]itar web\s*\|/,
        /\{\{\s*[Cc]itar vídeo(?: notas|)\s*\|/,
        /\{\{\s*[Cc]itar tese\s*\|/,
        /\{\{\s*[Cc]itar revista\s*\|/,
        /\{\{\s*[Cc]itar relatório\s*\|/,
        /\{\{\s*[Cc]itar podcast\s*\|/,
        /\{\{\s*[Cc]itar periódico\s*\|/,
        /\{\{\s*[Cc]itar mapa\s*\|/,
        /\{\{\s*[Cc]itar livro\s*\|/,
        /\{\{\s*[Rr]eferência a livro\s*\|/,
        /\{\{\s*[Cc]itar lista de discussão\s*\|/,
        /\{\{\s*[Cc]itar jornal\s*\|/,
        /\{\{\s*[Cc]itar jogo eletrônico\s*\|/,
        /\{\{\s*[Cc]itar notícia\s*\|/,
        /\{\{\s*[Cc]itar grupo de notícias\s*\|/,
        /\{\{\s*[Cc]itar episódio\s*\|/,
        /\{\{\s*[Cc]itar entrevista\s*\|/,
        /\{\{\s*[Cc]itar enciclopédia\s*\|/,
        /\{\{\s*[Cc]itar discurso\s*\|/,
        /\{\{\s*[Cc]itar conferência\s*\|/,
        /\{\{\s*[Cc]itar comunicados? de imprensa\s*\|/,
        /\{\{\s*[Cc]itar ar[Xx]iv\s*\|/,
        /\{\{\s*[Cc]ite ?web\s*\|/,
        /\{\{\s*[Cc]ite video(?: game|)\s*\|/,
        /\{\{\s*[Cc]ite AV media(?: notes|)\s*\|/,
        /\{\{\s*[Cc]ite thesis\s*\|/,
        /\{\{\s*[Cc]ite magazine\s*\|/,
        /\{\{\s*[Cc]ite report\s*\|/,
        /\{\{\s*[Cc]ite podcast\s*\|/,
        /\{\{\s*[Cc]ite ?news(?:paper|)\s*\|/,
        /\{\{\s*[Cc]ite map\s*\|/,
        /\{\{\s*[Cc]ite book\s*\|/,
        /\{\{\s*[Cc]ite mailing list\s*\|/,
        /\{\{\s*[Cc]ite journal\s*\|/,
        /\{\{\s*[Cc]ite document\s*\|/,
        /\{\{\s*[Cc]ite paper\s*\|/,
        /\{\{\s*[Cc]ite newsgroup\s*\|/,
        /\{\{\s*[Cc]ite episode\s*\|/,
        /\{\{\s*[Cc]ite serial\s*\|/,
        /\{\{\s*[Cc]ite interview\s*\|/,
        /\{\{\s*[Cc]ite encyclopedia\s*\|/,
        /\{\{\s*[Cc]ite conference\s*\|/,
        /\{\{\s*[Cc]ite press(?: release|)\s*\|/,
        /\{\{\s*[Cc]ite ar[xX]iv\s*\|/,
        /\{\{\s*[Cc]itation\s*\|/,
        /\{\{\s*[Aa]rticle\s*\|/
    ],
    ordem: ['datas', 'tradpred', 'geral', 'duplicado']
}

function verifDuplicado(achou) {
    function acharAninhados(cap) {
        var colch = 0;
        var chaves = 0;
        var r = '';
        for (var i = 0; i < cap.length; r += cap[i++]) {
            if (cap.charAt(i) == '[' && cap.charAt(i + 1) == '[') {
                if (chaves == 0) colch++;
                r += cap[i++];
            } else if (cap.charAt(i) == ']' && cap.charAt(i + 1) == ']') {
                if (chaves == 0) colch--;
                if (colch < 0) colch = 0;
                r += cap[i++];
            } else if (cap.charAt(i) == '{' && cap.charAt(i + 1) == '{') {
                if (colch > 0) return achou[0];
                chaves++;
                r += cap[i++]
            } else if (cap.charAt(i) == '}' &&
                (cap.charAt(i + 1) == '}' || cap.charAt(i + 1) == '')) {
                // será < 0 se atingir o fim da delimitação
                chaves--;
                if (chaves < 0) {
                    if (colch == 0) return r;
                    else return achou[0];
                }
                r += cap[i++];
            } else if (cap.charAt(i) == '|') {
                if (colch == 0 && chaves == 0) return r;
            }
        }
        if (colch == 0 && chaves == 0) return r;
        else return achou[0];
    }
    var ultimo = acharAninhados(achou[4]);
    if (ultimo == achou[0]) return achou[0];
    if (/[^\s]+/.test(ultimo)) {
        //o padrão do MediaWiki escolhe o último em caso de repetição, que se apague o primeiro
        var primeiro = acharAninhados(achou[2]);
        if (primeiro == achou[0]) return achou[0];
        return achou[2].substring(primeiro.length) + achou[3] + achou[4];
    } else {
        //se o último for vazio, mesmo sendo o padrão escolhido, faz sentido removê-lo
        return achou[1] + achou[2] + achou[4].substring(ultimo.length);
    }
}

// apenas parâmetros das predefinições delimitadas
listaDupl = ['(?:acessodata|acessadoem)', 'data', 'obra', 'local', 'publicado', 't[ií]tulo'
    , '(?:l[ií]ngua|idioma)', '(?:ligação inac?tiva|li|datali|urlmorta|dead\\-?url)'];

duplicado = [];

for (var i = 0; i < listaDupl.length; i++) {
    duplicado.push({
        reg: new RegExp("(\\|\\s*" + listaDupl[i] + "\\s*=)([\\s\\S]*)(\\|"
            + listaDupl[i] + "\\s*=)([\\s\\S]*)"),
        subs: function (achou) {
            return verifDuplicado(achou);
        }
    });
}

citacoes.duplicado.cond = duplicado;

links = [
    {
        reg: /<a\s*.*href\s*=\s*\"?([^\"&]*)\"?\s*[^&]*<\s*\/\s*a\s*>/, subs: function (achou) {
            var acao;
            var value = novoEditor ? 'submit' : 'edit';
            if (/\?/.test(achou[1])) acao = '&action=' + value;
            else acao = (/%3F/.test(achou[1])) ? '?&action=' + value : '?action=' + value;

            return achou[0] + '&nbsp;<a href="javascript:subsTextoBox(window.open(\''
                + encodeURIComponent(achou[1]) + acao + '\'))">Editar</a>';
        }
    },
    {
        reg: /<a\s*.*href\s*=\s*\"?([^\"&]*)\"?\s*.*<\s*\/\s*a\s*>/, subs: function (achou) {
            var acao;
            var value = novoEditor ? 'submit' : 'edit';
            if (/\?/.test(achou[1])) acao = '&action=' + value;
            else acao = (/%3F/.test(achou[1])) ? '?&action=' + value : '?action=' + value;

            return achou[0] + '&nbsp;<a href="javascript:subsTextoBox(window.open(\''
                + encodeURIComponent(achou[1]) + acao + '\'))">Editar</a>';
        }
    }
]

geral = [
    {
        reg: /\[\[(?:file|image):([^\[\]]*\]\])/i, subs: function (achou) {
            return '[[Imagem:' + achou[1];
        }
    }, {
        reg: /(\[\[\s*imagem|\[\[\s*ficheiro)(:[^\]]*)\.\]\]/i, subs: function (achou) {
            return achou[1] + achou[2] + ']]';
        }
    }, {
        reg: /\[\[[Aa]nexo:([^\[\]]*\]\])/, subs: function (achou) {
            return '[[' + achou[1];
        }
    }, {
        reg: /\[\[\s*([^\[\]]+)\s*\|\s*([^\[\]]+)\s*\]\]/, subs: function (achou) {
            var quot = '';
            var tmp = (achou[2].charAt(0).toLocaleLowerCase() + achou[2].replace(/_/g, " ").substring(1)).indexOf
                (achou[1].charAt(0).toLocaleLowerCase() + achou[1].replace(/_/g, " ").substring(1));

            if (tmp != 0) {
                quot = achou[2].match(/^(''''')(.+)\1$/) || achou[2].match(/^(''')(.+)\1$/) || achou[2].match(/^('')(.+)\1$/) || achou[2].match(/^(')(.+)\1$/) || achou[2].match(/^(")(.+)\1$/);

                if (!quot) return achou[0];

                achou[2] = quot[2];
                quot = quot[1];
                tmp = (achou[2].charAt(0).toLocaleLowerCase() + achou[2].replace(/_/g, " ").substring(1)).indexOf
                    (achou[1].charAt(0).toLocaleLowerCase() + achou[1].replace(/_/g, " ").substring(1));
            }

            if (tmp == 0) {
                var apos = achou[2].substring(achou[1].length);
                if (/^[a-zàáâãçéêíòóôõúü]*[,\.;)]?$/.test(apos))
                    return quot + '[[' + achou[2].substring(0, achou[1].length)
                        + ']]' + apos + quot;
            }
            return achou[0];
        }
    }, {
        reg: /(<\s*ref\s+(?:[^<>]*\s+)?name=[^<>]+)\s*>\s*<\s*\/ref\s*>/i, subs: function (achou) {
            return achou[1] + ' />';
        }
    }, {
        reg: / *[\.,;]? *(<\s*ref(?:\s+[^<>]*)?>[^<>]*<\s*\/ref\s*>|<\s*ref\s+[^<>]*\/>) *([\.,;])/i, subs: function (achou) {
            return achou[2] + achou[1];
        }
    }, {
        reg: /([\w\.\],;'"]|(?:<\/ref\s*>)|(?:<ref\s*(?:\s+[^<>]+|)\/>)) +<\s*ref([\s>])/i, subs: function (achou) {
            return achou[1] + '<ref' + achou[2];
        }
    }, {
        reg: /(<\/ref>)(\w)/i, subs: function (achou) {
            return achou[1] + ' ' + achou[2];
        }
    }/* Código desativado para corrigir <ref name=nome> para <ref name="nome"/>
    , { reg: /(<\s*ref\s+(?:[^<>]+\s+|)(?:name|group)\s*=)([^\s\/"'`=<>]+)(\/>|\s|>)/i, subs: function(achou){
    return achou[1] + '"' + achou[2] + '"' + achou[3];
} }*/, {
        reg: /<\s*br\s*clear\s*=\s*\"?(none|left|right|both|initial|inherit|all)\"?\s*\/?>/i, subs: function (achou) {
            if (achou[1].toLowerCase() == "all")
                achou[1] = "both";
            return '<br style="clear: ' + achou[1] + '">';
        }
    }, {
        reg: /<\s*[\/\\]\s*br\s*>/i, subs: function (achou) {
            return '<br>';
        }
    }, {
        reg: /<\s*br\s*[\\\n](\/|)>/i, subs: function (achou) {
            return '<br' + achou[1] + '>';
        }
    }, {
        reg: /Encyclopa?edia Britannica/, subs: function (achou) {
            return 'Encyclopædia Britannica';
        }
    }, {
        reg: /([^\\=]) +\n/, subs: function (achou) {
            return achou[1] + '\n';
        }
    }, {
        reg: /\{\{\s*(?:[Ll]igação inativa|[Ll]ink quebrado|[Dd]ead\s?link)\s*\|\s*dat[ea]\s*=\s*([A-Za-zç]+)\s+d?e?\s*(\d\d\d\d?)/, subs: function (achou) {
            var tmp = tradMes(achou[1]);
            if (tmp.match(/falhou/)) return achou[0];
            else return '{{ligação inativa|data=' + tmp + ' de ' + achou[2];
        }
    }, {
        reg: /\{\{\s*(?:[Dd]ead\s?link|[Ll]ink quebrado)\s*(\}\}|\|)/, subs: function (achou) {
            return '{{ligação inativa' + achou[1];
        }
    }, {
        reg: /(\{\{\s*(?:[Cc]itar (?:web\s*\||vídeo\s*\||vídeo notas\s*\||tese\s*\||revista\s*\||relatório\s*\||podcast\s*\||periódico\s*\||mapa\s*\||livro\s*\||lista de discussão|jornal\s*\||notícia\s*\||grupo de notícias|episódio\s*\||entrevista\s*\||enciclopédia\s*\||discurso\s*\||conferência\s*\||comunicados? de imprensa|ar[Xx]iv\s*\|)|[Cc]itation\s*\|)[^\{]*)\}\}\s*\{\{\s*[Ll]igação inativa\s*(?:\|dat[ea]\s*=(\s*[A-Za-zç]+\s+de\s*\d\d\d\d?)\s*|)(?:\|\s*bot=[^\}]*|)\}\}/, subs: function (achou) {
            return achou[1] + '|datali=' + (achou[2] ? achou[2] : mesesPt[(new Date).getMonth()]
                + ' de ' + (new Date).getFullYear()) + '}}';
        }
    }, {
        reg: /\{\{\s*(?:[Mm]\-notas|[Mm]\-fontes|[Mm]ais\-?notas|[Mm]ais[ \-]?fontes|[Mm]ais\-referências|[Pp]oucas fontes|[Ff]altam fontes)\s*(\}\}|\|)/, subs: function (achou) {
            return '{{mais notas' + achou[1];
        }
    }, {
        reg: /\{\{\s*(?:[Ff]ormatação|[Rr]eciclar|[Cc]leanup)\s*(\}\}|\|)/, subs: function (achou) {
            return '{{reciclagem' + achou[1];
        }
    }, {
        reg: /\{\{\s*(?:[Cc]itation needed|[Ff]act|[Cc]arece de fonte|[Cc]arece\-de\-fontes|[Cc]arece fontes|[Cc]itação necessária|[Cc]ite as fontes)\s*(\}\}|\|)/, subs: function (achou) {
            return '{{carece de fontes' + achou[1];
        }
    }, {
        reg: /\{\{\s*[Ss]em\-notas\s*(\}\}|\|)/, subs: function (achou) {
            return '{{sem notas' + achou[1];
        }
    }, {
        reg: /\{\{\s*(?:[Mm](?:ais|)\-fontes-bpv|[Mm]ais\-notas\-bpv)\s*(\}\}|\|)/, subs: function (achou) {
            return '{{mais notas-bpv' + achou[1];
        }
    }, {
        reg: /\{\{\s*([Cc]arece de fontes2?|[Rr]eciclagem|[Ss]em\-fontes|[Ss]em notas|[Mm]ais fontes|[Mm]ais notas\-bpv|[Ll]igação inativa|[Mm]ultitag)((?:\|[^\{\}]*))?\|\s*dat[ea]\s*=\s*([A-Za-zç]+)\s+d?e?\s*(\d\d\d\d?)/, subs: function (achou) {
            var tmp = tradMes(achou[3]) + ' de ' + achou[4];
            if (tmp.match(/falhou/)) return achou[0];
            else return '{{' + achou[1] + (achou[2] ? achou[2] : '') + '|data=' + tmp;
        }
    }, {
        reg: /\{\{\s*[Ss](?:em)\-fontes\s*\|\s*dat[ea]\s*=\s*([A-Za-zç]+)\s+d?e?\s*(\d\d\d\d?)/, subs: function (achou) {
            var tmp = tradMes(achou[1]);
            if (tmp.match(/falhou/)) return achou[0];
            else return '{{sem fontes|data=' + tmp + ' de ' + achou[2];
        }
    }, {
        reg: /\{\{\s*[Ff]\-referências\s*\|\s*dat[ea]\s*=\s*([A-Za-zç]+)\s+d?e?\s*(\d\d\d\d?)/, subs: function (achou) {
            var tmp = tradMes(achou[1]);
            if (tmp.match(/falhou/)) return achou[0];
            else return '{{formatar referências|data=' + tmp + ' de ' + achou[2];
        }
    }, {
        reg: /\{\{\s*wkf\s*\|\s*dat[ea]\s*=\s*([A-Za-zç]+)\s+d?e?\s*(\d\d\d\d)/, subs: function (achou) {
            var tmp = tradMes(achou[1]);
            if (tmp.match(/falhou/)) return achou[0];
            else return '{{wikificação|data=' + tmp + ' de ' + achou[2];
        }
    }, {
        reg: /\{\{\s*(?:[Mm]\-notas|[Mm]\-fontes)\s*\}\}/, subs: function (achou) {
            return '{{mais notas|data=' + mesesPt[(new Date).getMonth()]
                + ' de ' + (new Date).getFullYear() + '}}';
        }
    }, {
        reg: /\{\{\s*[Ss](?:em)\-fontes\s*\}\}/, subs: function (achou) {
            return '{{sem fontes|data=' + mesesPt[(new Date).getMonth()]
                + ' de ' + (new Date).getFullYear() + '}}';
        }
    }, {
        reg: /\{\{\s*[Ff]\-referências\s*\}\}/, subs: function (achou) {
            return '{{formatar referências|data=' + mesesPt[(new Date).getMonth()]
                + ' de ' + (new Date).getFullYear() + '}}';
        }
    }, {
        reg: /\{\{\s*wkf\s*\}\}/, subs: function (achou) {
            return '{{wikificação|data=' + mesesPt[(new Date).getMonth()]
                + ' de ' + (new Date).getFullYear() + '}}';
        }
    }, {
        reg: /\{\{\s*([Cc]arece de fontes|[Rr]eciclagem|[Ss]em\-fontes|[Ss]em notas|[Mm]ais fontes|[Mm]ais notas\-bpv|[Ll]igação inativa|[Mm]ultitag)\s*((?:\|[^\{\}]*)?\}\})/, subs: function (achou) {
            if (achou[2].match(/\|\s*[Dd]at[ae]\s*=/)) return achou[0];

            tmpReg = /(?:\||(?:\|[Dd]esde|[Dd]at[ea])\s*=?|=)\s*(?:\d\d?\s+d?e?\s*)?([A-Za-zç]+)\s+d?e?\s*(\d\d\d\d)\s*(\||\}\})/;
            var tmp = achou[2].match(tmpReg);
            if (tmp) {
                tmp = '|data=' + tradMes(tmp[1]) + ' de ' + tmp[2] + tmp[3];
                if (!tmp.match(/falhou/)) return '{{' + achou[1] + achou[2].replace(tmpReg, tmp);
            }
            return '{{' + achou[1] + '|data=' + mesesPt[(new Date).getMonth()]
                + ' de ' + (new Date).getFullYear() + achou[2];
        }
    }, {
        reg: /\{\{\s*([Cc]arece de fontes\/bloco|[Cc]arece de fontes2)\s*((?:\|[^\{\}]*)?\}\})/, subs: function (achou) {
            if (achou[2].match(/\|\s*[Dd]at[ae]\s*=/)) return achou[0];

            return '{{' + achou[1] + '|data=' + mesesPt[(new Date).getMonth()]
                + ' de ' + (new Date).getFullYear() + achou[2];
        }
    }, {
        reg: /\{\{\s*(?:[Ll]igações [Ee]xternas|[Pp]áginas externas|[Rr]eferências externas|[Ll]inks|[Ll]ink externo|[Ll]igação externa|[Ll]inks externos)\s*\}\}/, subs: function (achou) {
            return 'Ligações externas';
        }
    }, {
        reg: /\{\{\s*[Vv]e(?:r|ja) [Tt]ambém\s*\}\}/, subs: function (achou) {
            return 'Ver também';
        }
    }, {
        reg: /\{\{\s*[Bb]ibliografia\s*\}\}/, subs: function (achou) {
            return 'Bibliografia';
        }
    }, {
        reg: /\n? *(\n)? *\{\{(?:[Ss]em ?interwikis?|[Ss]eminterwiki-categorias|[Ss]emiwcat|[Ss]em[ \-]?iw)\s*(?:\|[^\{\}]*)?\}\} *(\n?) *\n/, subs: function (achou) {
            return '\n' + ((achou[1] || achou[2]) ? '\n' : '');
        }
    }, {
        reg: /\{\{(?:[Ss]em ?interwikis?|[Ss]eminterwiki-categorias|[Ss]emiwcat|[Ss]em[ \-]?iw)\s*(?:\|[^\{\}]*)?\}\}([^\n])/, subs: function (achou) {
            return achou[1];
        }
    }, {
        reg: /(\n *(?:==|\{\{)\s*referências\s*(?:==|(?:\|[^\}]*)?\}\})[\s\S]*)(\n\s*==\s*ver também\s*==[\s\S]*)/i, subs: function (achou) {
            var p1 = achou[2], p2 = "";

            var maisSecao;
            while (maisSecao = p1.match(/(\n\s*==\s*ver também\s*==[\s\S]*)(\n\s*==\s*[^=]*\s*==[\s\S]*)/i)) {
                p1 = maisSecao[1];
                p2 = maisSecao[2] + p2;
            }

            if (!p2) {
                while (maisSecao = p1.match(/(\n\s*==\s*ver também\s*==[\s\S]*)(\n\s*(?:\[\[categor(?:ia|y)\:.*\]\]|\{\{.*\}\})[\s\S]*)/i)) {
                    p1 = maisSecao[1];
                    p2 = maisSecao[2] + p2;
                }
            }

            return p1.replace(/(.)\n*$/, "$1\n") + achou[1] + p2;
        }
    }]
// { reg: /\{\{\s*[Cc]itar not[ií]cia *(\n?) *\|/, subs: function(achou){
// return '{{citar jornal' + (achou[1] ? achou[1] : '') + '|';
//} }

foraDePredef = [
    {
        reg: /(\n\*[^\n]+)<\s*br\s*\/?>(\s*\n)/i, subs: function (achou) {
            return achou[1] + achou[2];
        }
    }, {
        reg: /(\n\*[^\n]+)\n\:\*/, subs: function (achou) {
            return achou[1] + "\n**";
        }
    }]

//predefinições com exceção de verificação
excecoes = [];

function substComExcecao(texto, cond, excecoes) {
    var tmp = '';

    for (var j = 0; j < cond.length; j++) {
        while (texto) {
            var pos = texto.search(cond[j].reg);
            while (excecoes.length > 0 && pos != -1) {
                var exce = -1;
                for (var i = 0; i < excecoes.length; i++) {
                    var _exce = texto.search(excecoes[i]);
                    if ((exce == -1) || (_exce != -1 && _exce < exce))
                        exce = _exce;
                }
                if (exce == -1) {
                    pos = texto.search(cond[j].reg);
                    break;
                }
                if (pos < exce) {
                    pos = texto.search(cond[j].reg);
                    break;
                }
                var bloco = 0;
                var exceInicial = exce;
                for (; exce < texto.length; exce++) {
                    if (texto.charAt(exce) == '{' && texto.charAt(exce + 1) == '{') {
                        bloco++;
                        exce++; //O próximo char já foi verificado
                    }
                    else if (texto.charAt(exce) == '}' && texto.charAt(exce + 1) == '}') {
                        bloco--;
                        exce++; //O próximo char já foi verificado
                    }
                    if (bloco == 0) break;
                }
                if (bloco != 0) {
                    var linhas = (tmp + texto.substring(0, exceInicial)).split('\n');
                    var erro = "Erro: O bloco da predefinição na linha: "
                        + linhas.length + ", e posição: "
                        + (linhas[linhas.length - 1].length + 1) + " nunca é fechado";

                    mw.notify(erro);
                    throw erro;
                }
                tmp += texto.substring(0, exce);
                texto = texto.substring(exce);
                pos = texto.search(cond[j].reg);
            }

            if (pos > -1) {
                tmp += texto.substring(0, pos);
                texto = texto.substring(pos);
                var achou = texto.match(cond[j].reg);
                texto = texto.replace(achou[0], '');
                tmp += cond[j].subs(achou);
            } else {
                tmp += texto;
                texto = "";
            }
        }
        texto = tmp;
        tmp = '';
    }
    return texto;
}

function substApenas(texto, cond, apenas, excecoes) {
    var tmp = '';

    while (texto) {
        var apen = -1;
        for (var i = 0; i < apenas.length; i++) {
            var _apen = texto.search(apenas[i]);
            if ((apen == -1) || (_apen != -1 && _apen < apen))
                apen = _apen;
        }
        if (apen == -1) {
            tmp += texto;
            texto = '';
            break;
        }

        var bloco = 1;
        var apenInicial = apen;
        for (++apen; apen < texto.length; apen++) {
            if (texto.charAt(apen) == '{' && texto.charAt(apen + 1) == '{') {
                bloco++;
                apen++; //O próximo char já foi verificado
            }
            else if (texto.charAt(apen) == '}' && texto.charAt(apen + 1) == '}') {
                bloco--;
                apen++; //O próximo char já foi verificado
            }
            if (bloco == 0) break;
        }
        if (bloco != 0) {
            var linhas = (tmp + texto.substring(0, apenInicial)).split('\n');
            var erro = "Erro: O bloco da predefinição na linha: "
                + linhas.length + ", e posição: "
                + (linhas[linhas.length - 1].length + 1) + " nunca é fechado";

            mw.notify(erro);
            throw erro;
        }
        if (excecoes) {
            apenInicial++;
            tmp += texto.substring(0, apenInicial)
                + substComExcecao(texto.substring(apenInicial, apen), cond, excecoes)
        } else tmp += texto.substring(0, apenInicial)
            + substituir(texto.substring(apenInicial, apen), cond);
        texto = texto.substring(apen);
    }

    return tmp;
}

function substituir(texto, cond) {
    var tmp = '';

    for (var j = 0; j < cond.length; j++) {
        while (texto) {
            var pos = texto.search(cond[j].reg);
            if (pos > -1) {
                tmp += texto.substring(0, pos);
                texto = texto.substring(pos);
                var achou = texto.match(cond[j].reg);
                texto = texto.replace(achou[0], '');
                tmp += cond[j].subs(achou);
            } else {
                tmp += texto;
                texto = "";
            }
        }
        texto = tmp;
        tmp = '';
    }
    return texto;
}

function validarSintaxePredefinicoes(temp, janela) {
    // Verificar se há blocos não fechados
    var bloco = 0;
    var pbloco = 0;
    for (var pos = 0; pos < temp.length; pos++) {
        if (temp.charAt(pos) == '<') {
            var partes = 0;
            var identif = ['math', 'nowiki'];
            var palavra = '';
            pos++
            escopo: while (pos < temp.length) {
                switch (partes) {
                    case 0:
                        if (/^\s$/.test(temp.charAt(pos))) {
                            pos++;
                            continue escopo;
                        }
                        partes++;
                        break;
                    case 1:
                        var c = temp.charAt(pos).toLowerCase();
                        if (/^[a-z]$/.test(c)) {
                            palavra += c;
                            pos++;
                            partes++
                            continue escopo;
                        } else break escopo;
                        break;
                    case 2:
                        var c = temp.charAt(pos).toLowerCase();
                        if (/^[a-z]$/.test(c)) {
                            palavra += c;
                            pos++;
                            continue escopo;
                        } else partes++;
                        break;
                    case 3:
                        for (var i = 0; i < identif.length; i++) {
                            if (palavra == identif[i]) {
                                partes++;
                                break;
                            }
                        }
                        if (partes == 3) break escopo;
                        break;
                    case 4:
                        if (temp.charAt(pos) == '/' && temp.charAt(pos + 1) == '>')
                            break escopo;
                        if (temp.charAt(pos) == '>') partes++;
                        pos++;
                        break;
                    case 5:
                        if (temp.charAt(pos) == '<') partes++;
                        pos++;
                        break;
                    case 6:
                        var b = false;
                        if (/^[\s\/]$/.test(temp.charAt(pos))) {
                            if (temp.charAt(pos) == '/') {
                                if (b) {
                                    partes = 5;
                                } else b = true;
                            }
                            pos++;
                            continue escopo;
                        }
                        partes++;
                        break;
                    case 7:
                        for (var num = 0; num < palavra.length; num++) {
                            if (palavra[num] != temp.charAt(pos).toLowerCase()) {
                                partes = 5;
                                break;
                            }
                            pos++
                        }
                        if (partes == 7) partes++;
                        break;
                    case 8:
                        if (/^[^>]$/.test(temp.charAt(pos))) pos++;
                        else { pos++; break escopo }
                        break;
                }
            }
        }
        if (temp.charAt(pos) == '{' && temp.charAt(pos + 1) == '{') {
            if (bloco == 0) pbloco = pos;
            bloco++;
            pos++; //O próximo char já foi verificado
        } else if (temp.charAt(pos) == '}' && temp.charAt(pos + 1) == '}') {
            bloco--;
            pos++; //O próximo char já foi verificado
        }
        if (bloco == -1) {
            var linhas = temp.substring(0, pos).split('\n');
            var textAviso = "<div style='color: red'>Aviso:</div> Na linha: " + linhas.length + ", e posição: " + linhas[linhas.length - 1].length + " teve bloco fechado sem nenhum aberto.";

            if (window.ve && window.ve.init) {
                if (!window.avisove) {
                    textAviso += " Para ignorar clique novamente em 'Ajustes'";
                    mw.notify(textAviso);
                }
            } else {
                janela.document.getElementById("editpage-copywarn").innerHTML += textAviso
                    + " Para ignorar clique em 'Mostrar alterações'";
            }
            aviso = true;
            bloco = 0;
        }
    }
    if (bloco != 0) {
        var linhas = temp.substring(0, pbloco).split('\n');
        var erro = "Erro: O bloco da predefinição na linha: "
            + linhas.length + ", e posição: "
            + (linhas[linhas.length - 1].length + 1) + " nunca é fechado";

        mw.notify(erro);
        throw erro;
    }
}


function subsTextoBox(janela) {
    if (janela == window) _();
    else $(janela).load(_);

    function _() {
        if (!janela.aposWait) {
            janela.box = null
            janela.sumarioEl = null;
        }
        janela.aposWait = undefined;

        if (janela.ve && janela.ve.init) {
            var mode = janela.ve.init.target.surface.getMode()
            if (mode == 'source') {
                box = {
                    valor: janela.ve.init.target.surface.model.documentModel.data.getSourceText(),
                    get value() {
                        return this.valor == null
                            ? '' : this.valor;
                    },
                    set value(val) {
                        this.valor = val.toString();
                    }
                }

                var tmp = $('.ve-ui-mwSaveDialog-summary')
                if (tmp.length > 0)
                    sumarioEl = tmp[0]
                else
                    sumarioEl = {
                        get value() {
                            return janela.ve.init.target.editSummaryValue == null
                                ? '' : janela.ve.init.target.editSummaryValue;
                        },
                        set value(val) {
                            janela.ve.init.target.editSummaryValue = val.toString();
                        }
                    }
            } else if (mode == 'visual') {
                if (!janela.box) {
                    //janela.ve.dm.MWWikitextSurfaceFragment.prototype.convertToSource(ve.init.target.surface.model.documentModel).done(function (source) {
                    wikitextPromise = ve.init.target.getWikitextFragment(ve.init.target.surface.model.documentModel, true);
                    ve.init.target.getSurface().createProgress(wikitextPromise, 'Gerando o WikiTexto').done(function (progressBar, cancelPromise) {
                        cancelPromise.fail(function () {
                            wikitextPromise.abort();
                        });
                    });
                    wikitextPromise.done(function (source) {
                        box = {
                            valor: source,
                            get value() {
                                return this.valor == null
                                    ? '' : this.valor;
                            },
                            set value(val) {
                                this.valor = val.toString();
                            }
                        }

                        var tmp = $('.ve-ui-mwSaveDialog-summary')
                        if (tmp.length > 0)
                            sumarioEl = tmp[0]
                        else
                            sumarioEl = {
                                get value() {
                                    return janela.ve.init.target.editSummaryValue == null
                                        ? '' : janela.ve.init.target.editSummaryValue;
                                },
                                set value(val) {
                                    janela.ve.init.target.editSummaryValue = val.toString();
                                }
                            }

                        janela.aposWait = true;
                        subsTextoBox(janela);
                    }).fail(function () {
                        mw.notify('Falhou ao tentar obter código fonte');
                    });
                    return;
                }
            } else {
                return;
            }
        } else if (janela.wikEd && janela.wikEd.textarea) {
            if (janela.wikEd.useWikEd === true)
                janela.wikEd.UpdateTextarea();
            box = janela.wikEd.textarea;
            janela.wikEd.useWikEd = false;
        } else if (janela.$('.CodeMirror').length) {
            try {
                box = janela.$('.CodeMirror')[0].CodeMirror;

                box.__defineGetter__('value', function () {
                    return this.getValue();
                });
                box.__defineSetter__('value', function (val) {
                    this.setValue(val);
                });
            } catch (e) {
                box = janela.document.getElementById('wpTextbox1');
            }

        } else {
            box = janela.document.getElementById('wpTextbox1');
        }
        if (!window.sumarioEl)
            sumarioEl = janela.document.getElementById('wpSummary');

        var temp = box.value;
        var mudou = {};
        var sumario = '';
        var comp;
        var escape = 0;
        var sumGeral = false;

        aviso = false;

        validarSintaxePredefinicoes(temp, janela);

        comp = temp.replace(/\{\{[Pp]redefinição:/g, "{{");
        if (comp != temp) {
            temp = comp;
            sumGeral = true;
        }


        for (var i = 0; i < citacoes.ordem.length; i++) {
            var obj = citacoes[citacoes.ordem[i]];
            escape = 0;
            do {
                if (escape == 6) {
                    mw.notify('Parece haver algo errado na operação: '
                        + obj.sumario + '. Parando a execução');
                    return;
                }
                escape++;
                comp = temp;
                temp = substApenas(temp, obj.cond, citacoes.apenas, [/\{\{/]);
                if ((!mudou[citacoes.ordem[i]]) && comp != temp) {
                    mudou[citacoes.ordem[i]] = true;
                    if (sumario)
                        sumario += ', ';
                    sumario += obj.sumario;
                }
            } while (comp != temp)
        }
        if (sumario) sumario += ' nas citações';

        escape = 0;
        do {
            if (escape == 20) {
                mw.notify("Parece haver algo errado ao aplicar ajustes gerais. Parando a execução");
                return;
            }
            escape++;
            comp = temp;
            temp = substComExcecao(temp, foraDePredef, [/\{\{/]);
            if ((!mudou.outros) && comp != temp) {
                sumGeral = true;
            }
        } while (comp != temp)

        escape = 0;
        do {
            if (escape == 12) {
                mw.notify("Parece haver algo errado ao aplicar ajustes gerais. Parando a execução");
                return;
            }
            escape++;
            comp = temp;
            temp = substituir(temp, geral);
            if ((!mudou.outros) && (comp != temp || sumGeral)) {
                mudou.outros = true;
                if (sumario != '')
                    sumario += ', outros ';
                sumario += 'ajustes';
            }
        } while (comp != temp)

        escape = 0;
        do {
            if (escape == 12) {
                mw.notify("Parece haver algo errado ao aplicar ajustes gerais. Parando a execução");
                return;
            }
            escape++;
            comp = temp;
            temp = mergeDuplicateRefs(temp);
        } while (comp != temp)

        box.value = temp;

        if (sumario != '')
            sumario += ' usando [[user:TiagoLubiana/Script de ajustes.js|script]]';
        {
            var tmpSmr = sumarioEl.value;
            if (tmpSmr) sumario += (sumario ? ', ' : '') + tmpSmr;
        }
        sumarioEl.value = sumario;

        if (!(janela.ve && janela.ve.init)) {
        	var tmp = janela.document.getElementById('wpMinoredit');
        	if (tmp)
                tmp.checked = true;
            if (!aviso) {
                //janela.document.getElementById('wpPreview').click();
                janela.document.getElementById('wpDiff').click();
                //janela.document.getElementById('wpSave').click();
            }
            box = null
            sumarioEl = null;
        } else {
            if (aviso) {
                if (!window.avisove) {
                    avisove = true;
                    return;
                }
            }
            avisove = false;

            var form = $('<form style="display:none" method="post" action="/wiki/' + janela.mw.config.get('wgPageName')
                + '"><input name="action" value="' + 'submit'
                + '"><textarea name="wpTextbox1">'
                + '</textarea><input name="wpSummary" value="' + sumarioEl.value
                + '"><input name="wpMinoredit" value="' + 'on'
                + '"><input name="wpDiff" value="' + 'Mostrar alterações'
                + '"><input name="editRevId" value="' + janela.mw.config.get("wgCurRevisionId")
                + '"><input name="parentRevId" value="' + janela.mw.config.get("wgCurRevisionId")
                + '"><input name="baseRevId" value="' + janela.mw.config.get("wgCurRevisionId")
                + '"><input name="wpStarttime" value="' + (new Date()).toISOString().replace(/[^0-9]/g, "").slice(0, -3)
                + ($("#ca-unwatch").length ? '"><input name="wpWatchthis" checked type="checkbox' : '')
                + '"><input name="mode" value="diff'
                + '"><input name="model" value="wikitext'
                + '"><input name="format" value="text/x-wiki'
                + '"><input name="wpUltimateParam" value="1'
                + '"></form>');

            form.find("textarea").val(box.value);
            $(document.body).append(form);
            window.onbeforeunload = null;
            form.submit();
        }
    }
}

var categoria;
var afluentes;
if (categoria = document.getElementById('mw-pages')) {
    if (categoria = categoria.getElementsByClassName('mw-content-ltr')[0]) {
        fCategoria = function () {
            categoria.innerHTML = substituir(categoria.innerHTML, links);
        }
        categoria.innerHTML = '<input type="button" value="Criar links de edição automática" onclick    ="fCategoria()" ><br>' + categoria.innerHTML
    }
} else if (afluentes = document.getElementById("mw-whatlinkshere-list")) {
    fAfluentes = function () {
        afluentes.innerHTML = substituir(afluentes.innerHTML, links)
    }
    afluentes.innerHTML = '<input type="button" value="Criar links de edição automática" onclick ="fAfluentes()" ><br>' + afluentes.innerHTML
    //afluentes.innerHTML = substituir(afluentes.innerHTML, links);
} else if (document.getElementById('wpTextbox1') && document.getElementById('wpDiff')) {
    document.getElementById('wpDiff').outerHTML =
        document.getElementById('wpDiff').outerHTML.replace('accesskey="v"', 'accesskey="d"')
            .replace('alt-shift-v', 'alt-shift-d')
        + '\n<input id="Ajustes automáticos" '
        + 'name="Ajustes automáticos" tabindex="7" title="Ajustes automáticos [alt-shift-a]" '
        + 'type="button" class="' + $("#wpDiff").prop("class") + '" value="Ajustes automáticos" accesskey="a" onclick="subsTextoBox(window)">';
    // subsTextoBox(window)
}

function isVe() {
    var tentativas = 5

	mw.loader.using('ext.visualEditor.ve').then(function() {
        var intervalo = setInterval(function () {
            if (ve.init) {
                if ($('.ve-ui-toolbar-ajustes').length || tentativas-- < 1) {
                    clearInterval(intervalo);
                } else if (ve.init.target && ve.init.target.surface) {
                    var mode = ve.init.target.surface.getMode()
                    if (mode == 'source' || mode == 'visual') {
                    
                        temp = document.createElement("z");
                        var refItem = $('.oo-ui-tool-name-showSave')[0];
                        if (refItem) {
                            $(refItem).after(temp);
                            temp.outerHTML = refItem.outerHTML;
                            
                            $($('.ve-ui-toolbar-saveButton')[1])
                                .removeClass('ve-ui-toolbar-saveButton')
                                .addClass('ve-ui-toolbar-ajustes');
                            
                            $('.ve-ui-toolbar-ajustes').find('.oo-ui-tool-title').html('Ajustes');
                            $($('.oo-ui-tool-name-showSave')[1])
                                .removeClass('oo-ui-tool-name-showSave')
                                .removeClass('oo-ui-widget-disabled')
                                .addClass('oo-ui-widget-enabled')
                                .parent()
                                .removeClass('oo-ui-toolGroup-disabled-tools')
                                .addClass('oo-ui-toolGroup-enabled-tools')
                            
                            $('.ve-ui-toolbar-ajustes').click(function () {
                                subsTextoBox(window);
                            });
                        }
                    }
                }
            }
        }, 5000);
    });
}
isVe();

$(document).ready(function () {
    $('#ca-ve-edit').click(isVe);
})
