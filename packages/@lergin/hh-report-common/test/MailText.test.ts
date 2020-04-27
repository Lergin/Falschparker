import {
  convertDecimalLocationToStr,
  mailTo,
  dateToISODate,
  dayOfOffence,
  timeOfOffence,
  subject,
  tatort,
  tatvorwurf,
  MailTemplateOptions,
} from "../src/MailText";

describe("convertDecimalLocationToStr(number)", () => {
  test("53.555446 -> 53°33'20\"", () => {
    expect(convertDecimalLocationToStr(53.555446)).toBe("53°33'20\"");
  });
  test("10.010181 -> 10°00'37\"", () => {
    expect(convertDecimalLocationToStr(10.010181)).toBe("10°00'37\"");
  });
  test("53.163056 -> 53°09'47\"", () => {
    expect(convertDecimalLocationToStr(53.163056)).toBe("53°09'47\"");
  });
  test("9.561266 -> 9°33'41\"", () => {
    expect(convertDecimalLocationToStr(9.561266)).toBe("9°33'41\"");
  });
});

describe("dateToISODate()", () => {
  test("2020-03-23", () => {
    expect(dateToISODate(new Date(2020, 2, 23, 5, 23, 12))).toBe("2020-03-23");
  });
});

describe("subject()", () => {
  test("HH AB 20 - 2020-04-27", () => {
    expect(
      subject({
        plate: "HH AB 20",
        date: 1588020191,
      } as MailTemplateOptions)
    ).toBe("Subject: HH AB 20 - 2020-04-27");
  });
});

describe("dayOfOffence()", () => {
  test("2020-04-27", () => {
    expect(
      dayOfOffence({
        date: 1588020191,
      } as MailTemplateOptions)
    ).toBe("Montag, 27. April 2020");
  });
});

describe("timeOfOffence()", () => {
  test("2020-04-27 22:43:11", () => {
    expect(
      timeOfOffence({
        date: 1588020191,
      } as MailTemplateOptions)
    ).toBe("22:43:11");
  });
});

describe("tatort()", () => {
  test("Musterstraße 23, 12345 Musterstadt (53°09'47\"N 9°33'41\"E)", () => {
    expect(
      tatort({
        loc: {
          lat: 53.163056,
          lon: 9.561266,
        },
        address: "Musterstraße 23, 12345 Musterstadt",
      } as MailTemplateOptions)
    ).toBe("Musterstraße 23, 12345 Musterstadt (53°09'47\"N 9°33'41\"E)");
  });
});

describe("tatvorwurf()", () => {
  test("Unzulässiges Halten (Geh-/Radweg)", () => {
    expect(
      tatvorwurf({
        parking: false,
        where: "Geh-/Radweg",
        obstruction: false,
        endangering: false,
        intend: false,
        intendReason: "",
      } as MailTemplateOptions)
    ).toBe("Unzulässiges Halten (Geh-/Radweg)");
  });
  test("Unzulässiges Parken (Kreuzung)", () => {
    expect(
      tatvorwurf({
        parking: true,
        where: "Kreuzung",
        obstruction: false,
        endangering: false,
        intend: false,
        intendReason: "",
      } as MailTemplateOptions)
    ).toBe("Unzulässiges Parken (Kreuzung)");
  });
  test("Unzulässiges Parken (Geh-/Radweg) mit Behinderung", () => {
    expect(
      tatvorwurf({
        parking: true,
        where: "Geh-/Radweg",
        obstruction: true,
        endangering: false,
        intend: false,
        intendReason: "",
      } as MailTemplateOptions)
    ).toBe("Unzulässiges Parken (Geh-/Radweg) mit Behinderung");
  });
  test("Unzulässiges Parken (Geh-/Radweg) mit Gefährdung", () => {
    expect(
      tatvorwurf({
        parking: true,
        where: "Geh-/Radweg",
        obstruction: false,
        endangering: true,
        intend: false,
        intendReason: "",
      } as MailTemplateOptions)
    ).toBe("Unzulässiges Parken (Geh-/Radweg) mit Gefährdung");
  });
  test("Unzulässiges Parken (Geh-/Radweg) mit Behinderung und Gefährdung", () => {
    expect(
      tatvorwurf({
        parking: true,
        where: "Geh-/Radweg",
        obstruction: true,
        endangering: true,
        intend: false,
        intendReason: "",
      } as MailTemplateOptions)
    ).toBe("Unzulässiges Parken (Geh-/Radweg) mit Behinderung und Gefährdung");
  });
  test("Vorsätzliches, unzulässiges Parken (Geh-/Radweg)", () => {
    expect(
      tatvorwurf({
        parking: true,
        where: "Geh-/Radweg",
        obstruction: false,
        endangering: false,
        intend: true,
        intendReason: "",
      } as MailTemplateOptions)
    ).toBe("Vorsätzliches, unzulässiges Parken (Geh-/Radweg)");
  });
  test("Vorsätzliches, unzulässiges Parken (Geh-/Radweg); Bereits zum 20. mal an dieser Stelle Angezeigt", () => {
    expect(
      tatvorwurf({
        parking: true,
        where: "Geh-/Radweg",
        obstruction: false,
        endangering: false,
        intend: true,
        intendReason: "Bereits zum 20. mal an dieser Stelle Angezeigt",
      } as MailTemplateOptions)
    ).toBe(
      "Vorsätzliches, unzulässiges Parken (Geh-/Radweg); Bereits zum 20. mal an dieser Stelle Angezeigt"
    );
  });
  test("Vorsätzliches, unzulässiges Halten (Geh-/Radweg) mit Behinderung und Gefährdung; Bereits zum 20. mal an dieser Stelle Angezeigt", () => {
    expect(
      tatvorwurf({
        parking: false,
        where: "Geh-/Radweg",
        obstruction: true,
        endangering: true,
        intend: true,
        intendReason: "Bereits zum 20. mal an dieser Stelle Angezeigt",
      } as MailTemplateOptions)
    ).toBe(
      "Vorsätzliches, unzulässiges Halten (Geh-/Radweg) mit Behinderung und Gefährdung; Bereits zum 20. mal an dieser Stelle Angezeigt"
    );
  });
});


describe("mailTo()", () => {
  test("anzeigenbusgeldstelle@bzg.hamburg.de", () => {
    expect(mailTo({ mailTo: "anzeigenbusgeldstelle@bzg.hamburg.de" } as MailTemplateOptions)).toBe(
      "To: <anzeigenbusgeldstelle@bzg.hamburg.de>"
    );
  });
});