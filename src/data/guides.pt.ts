// pt-BR versions of the core allowance guides (Korean program names explained in Portuguese).
import type { Guide } from "./guides";

const VERIFIED_AT = "2026-09-28";
const HAPPY_BIRTH_URL = "https://www.gov.kr/portal/onestopSvc/happyBirth";
const FIRST_MEETING_SOURCE =
  "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004656";
const PARENT_ALLOWANCE_SOURCE =
  "https://www.bokjiro.go.kr/ssis-tbu/cms/pc/customer/notice/1309189_1141.html";
const CHILD_ALLOWANCE_SOURCE = "https://www.mohw.go.kr/menu.es?mid=a10711030100";
const EASYLAW_FOREIGN =
  "https://m.easylaw.go.kr/MOM/SubCsmOvRetrieve.laf?ccfNo=1&cciNo=1&cnpClsNo=1&csmSeq=2328&langCd=700101";

const FOREIGN_NOTE =
  "Pais estrangeiros: os dois auxílios exigem que a criança tenha nacionalidade coreana e número de registro de residente (주민등록번호). Não tem problema se os dois pais forem estrangeiros. Dupla cidadania e refugiados reconhecidos estão incluídos; solicitantes de refúgio ainda em análise, não. Veja o guia para pais estrangeiros: newbornkr.online/pt-br/guide/foreign-parents.";

export const PT_GUIDES: Record<string, Guide> = {
  "parent-and-child-allowance": {
    slug: "parent-and-child-allowance",
    title: "Dá para receber o Auxílio para Pais (부모급여) e o Auxílio Infantil (아동수당) ao mesmo tempo?",
    eyebrow: "Coreia inteira · regras de 2026",
    summary:
      "Sim. O Auxílio para Pais (부모급여, pagamento mensal do governo coreano para bebês de 0 a 23 meses) e o Auxílio Infantil (아동수당, pagamento mensal para crianças menores de 9 anos) são programas nacionais separados. Se você cumprir os requisitos de cada um, pode pedir os dois. Veja também como o Auxílio para Pais muda quando a criança vai para a creche.",
    verifiedAt: VERIFIED_AT,
    regionId: "national",
    relatedBenefitIds: ["nat-002", "nat-003", "nat-004"],
    sections: [
      {
        heading: "Os dois programas pagam separadamente",
        body:
          "O serviço Happy Birth (행복출산) do Government24 lista o Auxílio para Pais e o Auxílio Infantil como serviços nacionais separados, e o Ministério da Saúde e Bem-Estar (보건복지부) também os descreve como políticas diferentes. Por isso, depois de pedir o Auxílio para Pais, não deixe de pedir o Auxílio Infantil: confira os dois itens.",
        note:
          "Esta orientação se baseia no fato de as informações oficiais listarem cada programa como um item separado. O direito real depende da confirmação dos requisitos da criança, do pedido e dos dados de pagamento.",
      },
      {
        heading: "Auxílio para Pais (부모급여): valores e prazo",
        bullets: [
          "Quem recebe: crianças menores de 2 anos (0 a 23 meses).",
          "Valores para quem cuida em casa: KRW 1 milhão por mês com 0 ano de idade e KRW 500 mil por mês com 1 ano.",
          "Para receber desde o mês do nascimento, faça o pedido em até 60 dias, contando o dia do nascimento. Se pedir depois de 60 dias, o pagamento começa no mês do pedido e os meses anteriores não são pagos retroativamente.",
          "Se a criança frequenta creche (어린이집), o valor não é pago todo em dinheiro: vira um voucher para a mensalidade da creche mais uma diferença em dinheiro. O guia de 2026 do Bokjiro indica mensalidade básica de KRW 584 mil e diferença de KRW 416 mil para 0 ano, e mensalidade básica de KRW 515 mil sem diferença para 1 ano.",
        ],
        note: FOREIGN_NOTE,
      },
      {
        heading: "Auxílio Infantil (아동수당): valor e quem pode receber",
        bullets: [
          "Pelas informações revisadas do Ministério da Saúde e Bem-Estar de 31 de março de 2026, o programa cobre crianças menores de 9 anos.",
          "O valor é de KRW 100 mil a 130 mil por mês, conforme o lugar onde você mora: KRW 100 mil na região metropolitana de Seul, KRW 105 mil fora dela, KRW 110 mil em áreas prioritárias de declínio populacional e KRW 120 mil em áreas especiais, com mais KRW 10 mil em moeda local.",
          "Normalmente o valor é depositado em dinheiro, mas leis municipais podem permitir o pagamento em vales de moeda local.",
          "O pedido pode ser feito pessoalmente no centro comunitário do bairro (읍·면·동 주민센터) ou online pelo Bokjiro (복지로, portal de bem-estar do governo).",
        ],
        note:
          "O valor e a forma de pagamento do Auxílio Infantil podem variar conforme o endereço. Se você se mudou ou quer saber se mora numa área especial, confirme com a prefeitura do seu endereço.",
      },
      {
        heading: "Como pedir os dois",
        bullets: [
          "Pelo serviço Happy Birth One-Stop do Government24 (정부24 행복출산), confira e peça o Auxílio para Pais e o Auxílio Infantil como itens separados — ou vá ao centro comunitário do endereço da criança.",
          "Atenção especial ao prazo de 60 dias do Auxílio para Pais, contando o dia do nascimento. Você pode ver a data na calculadora de prazo do Auxílio para Pais. O pedido online pode ser restrito conforme o tipo de responsável; confira as regras no Government24 ou no Bokjiro.",
          "Se a criança vai usar creche ou serviço de cuidado em tempo integral, confira separadamente o pedido desse serviço e a forma de pagamento do Auxílio para Pais.",
        ],
      },
    ],
    applicationLinks: [
      { label: "Calculadora de prazo do Auxílio para Pais", url: "/guide/parent-allowance-deadline" },
      { label: "Government24 Happy Birth One-Stop (정부24 행복출산)", url: HAPPY_BIRTH_URL },
      { label: "Bokjiro: como pedir o Auxílio para Pais", url: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004657" },
      { label: "Bokjiro: buscar serviços", url: "https://www.bokjiro.go.kr/" },
    ],
    sources: [
      { label: "Auxílio para Pais 2026 (2026년 부모급여 지원 안내) — Bokjiro", url: PARENT_ALLOWANCE_SOURCE },
      { label: "Pagamento do Auxílio Infantil (아동수당) — Ministério da Saúde e Bem-Estar", url: CHILD_ALLOWANCE_SOURCE },
      { label: "Apoio ao parto para estrangeiros — Easy Law (Ministério de Legislação Governamental)", url: EASYLAW_FOREIGN },
      { label: "Happy Birth One-Stop — Government24", url: HAPPY_BIRTH_URL },
    ],
  },
  "birth-registration-checklist": {
    slug: "birth-registration-checklist",
    title: "Checklist de benefícios para pedir depois do registro de nascimento",
    eyebrow: "Depois do nascimento · benefícios nacionais + locais",
    summary:
      "Logo depois do registro de nascimento (출생신고), confira os benefícios nacionais separadamente dos apoios da prefeitura onde você mora. O Auxílio para Pais (부모급여) precisa ser pedido em até 60 dias, contando o dia do nascimento, para ser pago desde o mês do nascimento.",
    verifiedAt: VERIFIED_AT,
    regionId: "national",
    relatedBenefitIds: ["nat-001", "nat-002", "nat-003", "nat-004"],
    sections: [
      {
        heading: "1. Confirme o registro de nascimento e o registro de residente da criança",
        body:
          "O Voucher Primeiro Encontro (첫만남이용권) é para crianças com registro de nascimento e número de registro de residente. Programas locais também podem ter condições de endereço ou de registro, como o registro de nascimento em Seul; por isso, confira o endereço registrado da criança antes de pedir.",
        note:
          "Pais estrangeiros: o Voucher Primeiro Encontro, o Auxílio para Pais e o Auxílio Infantil exigem que a criança tenha nacionalidade coreana (os dois pais podem ser estrangeiros; dupla cidadania e refugiados reconhecidos estão incluídos, solicitantes de refúgio em análise não). Veja o guia para pais estrangeiros: newbornkr.online/pt-br/guide/foreign-parents.",
      },
      {
        heading: "2. Auxílio para Pais (부모급여) — resolva primeiro o prazo de 60 dias",
        bullets: [
          "Para crianças menores de 2 anos. Para quem cuida em casa, são KRW 1 milhão por mês com 0 ano e KRW 500 mil por mês com 1 ano.",
          "Peça em até 60 dias, contando o dia do nascimento, para receber desde o mês do nascimento. Se perder o prazo, o pagamento começa no mês do pedido. Veja a data na calculadora de prazo do Auxílio para Pais.",
          "Se a criança usar creche ou cuidado em tempo integral, o pagamento vira apoio para mensalidade ou para o serviço de cuidado; peça esse serviço separadamente.",
        ],
      },
      {
        heading: "3. Voucher Primeiro Encontro (첫만남이용권) — no Cartão Nacional da Felicidade",
        bullets: [
          "Um voucher nacional de KRW 2 milhões para o primeiro filho e KRW 3 milhões a partir do segundo, carregado no Cartão Nacional da Felicidade (국민행복카드).",
          "Pelo guia do Bokjiro, a criança precisa ter registro de nascimento e número de registro de residente; crianças nascidas a partir de 2024 podem receber se ainda não tiverem passado 2 anos desde o nascimento.",
          "Peça no centro administrativo de bem-estar do bairro, pelo Bokjiro ou pelo Government24. O guia de Busan explica que o voucher pode ser usado por até 2 anos a partir do nascimento e que os pontos não usados expiram no fim do prazo.",
        ],
      },
      {
        heading: "4. Auxílio Infantil (아동수당) — é um pedido separado",
        bullets: [
          "Pelas informações revisadas do Ministério da Saúde e Bem-Estar de 31 de março de 2026: para crianças menores de 9 anos; KRW 100 mil a 130 mil por mês, conforme o endereço.",
          "Peça no centro comunitário do bairro (읍·면·동 주민센터) ou pelo Bokjiro. É separado do Auxílio para Pais, então confira os dois itens.",
        ],
      },
      {
        heading: "5. Confira também o apoio ao nascimento da sua cidade",
        body:
          "O Happy Birth do Government24 lista à parte os serviços das prefeituras, como os bônus de nascimento de províncias, cidades e distritos; eles variam conforme o governo local. Com base no seu endereço, confira os avisos oficiais e os prazos da prefeitura.",
        bullets: [
          "Seul: o apoio de Seul para cuidados pós-parto exige que a mãe more em Seul há pelo menos 90 dias na data do pedido, registro de nascimento em Seul e pedido em até 180 dias após o parto.",
          "Suwon: confira o critério de 180 dias de residência em Suwon do bônus de nascimento da cidade e o prazo de até 1 ano após o nascimento. O apoio pós-parto da província de Gyeonggi é outro programa e deve ser pedido em até 12 meses após o nascimento.",
          "Busan: o bônus adicional de nascimento da cidade é a partir do segundo filho, exige que pai/mãe e criança tenham o mesmo endereço de registro em Busan no registro do nascimento e pedido em até 3 meses após o nascimento.",
        ],
        note:
          "Valores, requisitos e prazos de outras cidades e distritos não foram verificados aqui. Confirme oficialmente no centro administrativo de bem-estar do seu endereço ou do endereço na época do nascimento.",
      },
      {
        heading: "6. Peça tudo junto quando possível ou procure o atendimento",
        bullets: [
          "No pedido online pelo Happy Birth do Government24, quem pede deve ser a mãe ou o cônjuge. Depois da verificação de identidade, preencha o formulário; o centro comunitário analisa e recebe o pedido.",
          "Para pedir pessoalmente, vá ao centro comunitário do endereço da criança. O Government24 orienta levar documento de identidade.",
          "Não presuma que todos os serviços podem ser pedidos de uma vez; confira os requisitos, documentos extras e procedimentos de cada programa e da prefeitura.",
        ],
      },
    ],
    applicationLinks: [
      { label: "Calculadora de prazo do Auxílio para Pais", url: "/guide/parent-allowance-deadline" },
      { label: "Pedir pelo Government24 Happy Birth One-Stop", url: HAPPY_BIRTH_URL },
      { label: "Bokjiro: Auxílio para Pais", url: PARENT_ALLOWANCE_SOURCE },
      { label: "Bokjiro: Voucher Primeiro Encontro", url: FIRST_MEETING_SOURCE },
      { label: "Ministério da Saúde e Bem-Estar: Auxílio Infantil", url: CHILD_ALLOWANCE_SOURCE },
    ],
    sources: [
      { label: "Happy Birth One-Stop — Government24", url: HAPPY_BIRTH_URL },
      { label: "Auxílio para Pais 2026 — Bokjiro", url: PARENT_ALLOWANCE_SOURCE },
      { label: "Voucher Primeiro Encontro — Bokjiro (2026)", url: FIRST_MEETING_SOURCE },
      { label: "Pagamento do Auxílio Infantil — Ministério da Saúde e Bem-Estar", url: CHILD_ALLOWANCE_SOURCE },
      { label: "Apoio de Seul para cuidados pós-parto — Seul", url: "https://umppa.seoul.go.kr/hmpg/sprt/bzin/bzmgComtDetail.do?biz_mng_no=58D83411277E40D1BFF6255A10CBCDD5" },
      { label: "Bônus de nascimento e adoção — Suwon", url: "https://www.suwon.go.kr/sw-www/deptHome/dep_welfare/welfare14/welfare14-01/welfare14-01-10.jsp" },
      { label: "Bônus de nascimento — Busan", url: "https://www.busan.go.kr/childcare/childcare010101" },
      { label: "Apoio ao parto para estrangeiros — Easy Law", url: EASYLAW_FOREIGN },
    ],
  },
};
