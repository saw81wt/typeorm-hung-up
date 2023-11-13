# Hang-up with　`relationLoadStrategy: query` for Multiple Calls

# Issue description
Using relationLoadStrategy set to "query" may result in a hang-up.

# Expected Behavior
When calling the find method with relationLoadStrategy set to "query" on tables with 1:N relationships, the process completes successfully.

# Actual Behavior:
When multiple find method calls are made simultaneously with this setting, the system fails to complete the process and experiences a hang-up.

# Steps to reproduce

## Entities
We have tables with 1:N relationships.
```typescript:User.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => Photo, (photo) => photo.user, { eager: false })
    photos: Photo[]
}
```

```typescript:Photo.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { User } from "./User"

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @ManyToOne(() => User, (user) => user.photos)
    user: User
}
```

## Bussiness Code
In our business code, we make simultaneous calls using the find method that includes relationships, setting the relationLoadStrategy to 'query'.

```typescript:main.ts
import { AppDataSource } from "../typeorm/data-source"
import { User } from "../typeorm/entity/User"

const main = async () => {
    await AppDataSource.initialize()
    const findUserWithPhoto = async () => {
        const repository = AppDataSource.getRepository(User)
        return await repository.findOne({
            where: { id: 1 },
            relations: {
                photos: true
            },
            relationLoadStrategy: "query"
        })
    }

    const result = []
    for (let i = 0; i < 10; i++) {
        result.push(findUserWithPhoto())
    }
    await Promise.all(result)
    await AppDataSource.destroy()
}

main()
```

For reproduction purposes, we are making multiple calls using a for loop. However, the same issue arises when server-side endpoints are rapidly and simultaneously accessed by clients

# My Environment

| Dependency          | Version  |
| ---                 | ---      |
| Operating System    |          |
| Node.js version     | 18.y.zzz  |
| Typescript version  | 5.2.2  |
| TypeORM version     | 0.3.16  |

# Additional Context
## probably the cause

In TypeORM, the [obtainQueryRunner()](https://github.com/typeorm/typeorm/blob/0.3.16/src/query-builder/SelectQueryBuilder.ts#L3844) is used to acquire a connection. However, the issue here is that `this.queryRunner` is set with a value only in certain cases, which leads to the system consistently evaluating the right-hand expression of obtainQueryRunner.

In the connection pool, if no connections are available, [the system waits until a new connection is released](https://github.com/typeorm/typeorm/blob/0.3.16/src/driver/mysql/MysqlQueryRunner.ts#L191C64-L191C64). If `obtainQueryRunner` is called multiple times within the queryRunner, there is a potential for a deadlock to occur between the release of a connection and the acquisition of a new one. This deadlock can cause the system to become unresponsive or hang.


# How to run

```bash
$ docker-compose up -d
$ yarn install
$ yarn migration:run
$ yarn seed
$ yarn start
```
