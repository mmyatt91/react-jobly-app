"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError } = require("../expressError");

class Job {
      /** Create jobs (from data), update db, return new company data.
   *
   * data should be { title, salary, equity, companyHandle}
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * */

   static async create (data) {
       const result = await db.query(
           `INSERT INTO jobs (title,
                              salary,
                              equity,
                              company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [data.title,
            data.salary,
            data.equity,
            data.companyHandle
        ]);
        let job = result.rows[0]
        return job;
   }

    /** Find all companies.
   *
   * Returns [{ id, title, salary, equity, companyHandle, companyName }, ...]
   * 
   * Optional filters have been outlined to search by name, minEmployees, or
   * maxEmployees.
   * */

   static async findAll({ title, minSalary, hasEquity } = {}) {
       const query = `SELECT j.id,
                             j.title,
                             j.salary,
                             j.equity,
                             j.company_handle AS companyHandle,
                             c.name AS companyName
                      FROM jobs j 
                        LEFT JOIN companies AS c ON c.handle = j.company_handle`
        let whereExps = [];
        let queryVals = [];

        const { title, minSalary, hasEquity} = optionalFilters

        //Handles searching by title
        if(title !== undefined) {
            queryVals.push(`%${title}%`)
            whereExps.push(`title ILIKE $${queryVals.length}`);
        }

        // Handles searching by minSalary
        if (minSalary !== undefined) {
            queryVals.push(minSalary)
            whereExps.push(`salary >= $${queryVals.length}`)
        }

        // Handles searching by hasEquity
        if(hasEquity === true) {
            whereExps.push(`equity > 0`)
        }

        if (whereExps.length > 0) {
            query += " WHERE " + whereExps.join(" AND ")
          };
      
        query += " ORDER BY title";
        const jobRes = await db.query(query, queryVals);
        return jobRes.rows;
        }             

      /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, company}
   *   where company is [{ handle, name, description, numEmployees, logoURL }, ...]
   *
   * Throws NotFoundError if not found.
   **/

   static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs 
            WHERE id=$1`, [id]);
        
        const job = jobRes.rows[0]
        
        if(!job) throw new NotFoundError(`No job: ${id}`);

        const companyRes = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoURL"
            FROM companies
            WHERE id=$1`, [job.companyHandle]);
    
        delete job.companyHandle;
        job.company = companyRes.rows[0];

        return job;
    }

    /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

   static async update (id, data) {
       const { setCols, values } = sqlForPartialUpdate(
           data,
           {});
       const idVarIdx = "$" + (values.length + 1);

       const querySql = `UPDATE jobs
                         SET ${setCols}
                         WHERE id = ${idVarIdx}
                         RETURNING id,
                                   title,
                                   salary,
                                   equity,
                                   company_handle AS "companyHandle"`
        
        const result = await db.query(querySql, [...values, handle]);
        const job = result.rows[0]

        if(!job) throw new NotFoundError(`No job: ${id}`);

        return job;
   }

     /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

   static async remove (id) {
       const result = await db.query(
            `DELETE 
            FROM jobs
            WHERE id = $1
            RETURNING id`, [id]);
       const job = result.rows[0];

       if(!job) throw new NotFoundError(`No job: ${id}`);
   }
}

module.exports = Job

