/**
 * Lightweight manual validation middleware factory.
 *
 * Each schema is a plain object where each key maps to a validator spec:
 *   {
 *     required?: boolean,
 *     type?: 'string' | 'number',
 *     maxLength?: number,
 *     pattern?: RegExp,
 *     custom?: (value, body) => string | null   // return error message or null
 *   }
 *
 * Usage:
 *   router.post('/path', validateBody(appointmentSchema), handler);
 */

export function validateBody(schema) {
  return (req, res, next) => {
    const body = req.body ?? {};
    const validationErrors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      const isEmpty =
        value === undefined || value === null || value === "";

      if (rules.required && isEmpty) {
        validationErrors.push(`Trường '${field}' là bắt buộc.`);
        continue;
      }

      if (isEmpty) continue; // optional and absent — skip further checks

      if (rules.type && typeof value !== rules.type) {
        validationErrors.push(
          `Trường '${field}' phải là kiểu ${rules.type}.`
        );
        continue;
      }

      if (rules.maxLength && typeof value === "string" && value.length > rules.maxLength) {
        validationErrors.push(
          `Trường '${field}' không được vượt quá ${rules.maxLength} ký tự.`
        );
      }

      if (rules.pattern && typeof value === "string" && !rules.pattern.test(value)) {
        validationErrors.push(
          `Trường '${field}' không đúng định dạng.`
        );
      }

      if (rules.custom) {
        const customError = rules.custom(value, body);
        if (customError) validationErrors.push(customError);
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(" ") });
    }

    return next();
  };
}

// ---------------------------------------------------------------------------
// Exported schemas
// ---------------------------------------------------------------------------

export const appointmentSchema = {
  name: {
    required: true,
    type: "string",
    maxLength: 100,
  },
  phone: {
    required: true,
    type: "string",
    pattern: /^0[0-9]{9,10}$/,
  },
  date: {
    required: true,
    type: "string",
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    custom(value) {
      const d = new Date(value + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(d.getTime()) || d < today) {
        return "Ngày hẹn phải là hôm nay hoặc trong tương lai.";
      }
      return null;
    },
  },
  time: {
    required: true,
    type: "string",
    pattern: /^([01][0-9]|2[0-3]):[0-5][0-9]$/,
    custom(value) {
      const hour = parseInt(value.split(":")[0], 10);
      if (hour < 8 || hour >= 17) {
        return "Giờ hẹn phải trong giờ làm việc (08:00 - 17:00).";
      }
      return null;
    },
  },
};
