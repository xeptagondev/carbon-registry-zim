import { AbilityBuilder, CreateAbility, createMongoAbility, ExtractSubjectType, InferSubjects, MongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entity";
import { Action } from "./action.enum";
import { Role } from "./role.enum";
import { EntitySubject } from "../entities/entity.subject";
import { Programme } from "../entities/programme.entity";
import { ProgrammeStage } from "../programme-ledger/programme-status.enum";
import { CompanyRole } from "../enum/company.role.enum";

type Subjects = InferSubjects<typeof EntitySubject> | 'all';

export type AppAbility = MongoAbility<[Action, Subjects]>;
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    console.log('createForUser', user)
    const { can, cannot, build } = new AbilityBuilder(createAppAbility);
    if (user) {
      if (user.role == Role.Root) {
        can(Action.Manage, 'all');
        cannot(Action.Update, User, ['role', 'apiKey', 'password', 'companyId', 'companyRole'], { id: { $eq: user.id } });
      }
      else if (user.role == Role.Admin && user.companyRole == CompanyRole.GOVERNMENT) {
        can(Action.Manage, 'all', { role: { $ne: Role.Root } });
        cannot(Action.Update, User, ['role', 'apiKey', 'password', 'companyId', 'companyRole'], { id: { $eq: user.id } });
      } else if (user.role == Role.Admin && user.companyRole != CompanyRole.GOVERNMENT) {
        cannot(Action.Update, User, ['role', 'apiKey', 'password', 'companyId', 'companyRole'], { id: { $eq: user.id } });
        can(Action.Manage, User, { companyId: { $eq: user.companyId } });
      } else {
        can([Action.Update, Action.Read], User, { id: { $eq: user.id } })
        cannot(Action.Update, User, ['email', 'role', 'apiKey', 'password', 'companyId', 'companyRole']);
      }
      // case Role.Api:
      //   can([Action.Create, Action.Read], Programme);
      //   cannot(Action.Update, User, ['email', 'role', 'apiKey', 'password']);
      //   break;
      // case Role.General:
      // case Role.ViewOnly:
      //   can(Action.Read, Programme);
      //   can([Action.Update, Action.Read], User, { id: { $eq: user.id }})
      //   cannot(Action.Update, User, ['email', 'role', 'apiKey', 'password']);
      //   break;
      // case Role.Certifier:
      //   can(Action.Read, Programme, { currentStage: { $in: [ ProgrammeStage.ISSUED, ProgrammeStage.RETIRED ]}});
      //   can([Action.Update, Action.Read], User, { id: { $eq: user.id }})
      //   cannot(Action.Update, User, ['email', 'role', 'apiKey', 'password']);
      //   break;
      // case Role.ProgrammeDeveloper:
      //   can(Action.Read, Programme, { currentStage: { $eq: ProgrammeStage.ISSUED }});
      //   can([Action.Update, Action.Read], User, { id: { $eq: user.id }})
      //   can(Action.Read, User, { role: { $eq: Role.Certifier }})
      //   cannot(Action.Update, User, ['email', 'role', 'apiKey', 'password']);
      //   break;

      // }
      cannot(Action.Delete, User, { id: { $eq: user.id } })
      cannot(Action.Update, User, ['companyId', 'companyRole'])
      cannot(Action.Create, User, { companyId: { $eq: -1 } })
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}