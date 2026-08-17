import { z } from "zod/v4";
import type { Notice, NoticeSubject } from "../../model/notices.js";
import { noticeSchema } from "../../model/notices.schema.js";
import type { DataResponse } from "../../model/response.js";
import { AbstractOffchainNamespace } from "../AbstractOffchainNamespace.js";
import type { GearboxAPIOptions } from "../types.js";

/**
 * Backend counterpart of `sdk.notices`: banners the backend asks a consumer to
 * show for one entity, see {@link Notice}.
 **/
export class OffchainNotices extends AbstractOffchainNamespace {
  readonly #root = "/v2/notices";

  constructor(options: GearboxAPIOptions) {
    super("OffchainNotices", options);
  }

  /**
   * The notices of one pool opportunity or one strategy position.
   **/
  public async list(subject: NoticeSubject): Promise<DataResponse<Notice[]>> {
    const [kind, address] =
      subject.kind === "pool"
        ? ["pool", subject.pool]
        : ["strategy", subject.creditAccount];
    return this.get({
      path: `${this.#root}/${kind}/${subject.chainId}/${address}`,
      schema: z.array(noticeSchema),
    });
  }
}
